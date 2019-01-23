"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapt_1 = require("@cycle/run/lib/adapt");
const xstream_1 = require("xstream");
const socket_supervisor_1 = require("./socket-supervisor");
const phoenix_1 = require("phoenix");
const phoenix_source_1 = require("./phoenix-source");
/**
 * Composes socket with SocketSupervisor state manager
 * @param socket ComposeSocket
 * @param socketsupervisor SocketSupervision
 * @returns void
 */
function composeSocket(socket, socketsupervisor) {
    const phoenixSock = new phoenix_1.Socket(socket.url, { params: socket.params });
    socketsupervisor.setSocket(socket.name, {
        name: socket.name,
        url: socket.url,
        params: socket.params,
        // Phoenixjs socket
        phoenix_socket: phoenixSock
    });
    // Connect
    phoenixSock.connect();
}
/**
 * Composes channel with SocketSupervisor state manager
 * @param channelOpts ComposeChannel
 * @param socketsupervisor SocketSupervision
 * @returns Stream<Channel>
 */
function composeChannel(channelOpts, sink$, socketsupervisor) {
    const socket = socketsupervisor.getSocket(channelOpts.socketId);
    const phoenixChan = socket.phoenix_socket.channel(channelOpts.topic, channelOpts.params);
    // Channel construction
    const channel = {
        name: channelOpts.name,
        topic: channelOpts.topic,
        socket: socket,
        phoenix_chan: phoenixChan,
        send: (event, message) => channel.phoenix_chan.push(event, message),
        on: (event, fn) => channel.phoenix_chan.on(event, (resp) => fn(resp))
    };
    // Set channel
    socketsupervisor.setChannel(channelOpts.name, channel);
    // Join
    phoenixChan.join();
    // Add context to this channel stream
    return Object.defineProperty(sink$, 'name', {
        value: channel.name,
        writable: false
    });
}
/**
 * Handles WRITE / OUT effects on channel
 * @param pusher Pusher
 * @param sink$ Stream<Compose>
 * @param socketsupervisor SocketSupervision
 * @return Stream<Channel>
 */
function pusher(pusher, sink$, socketsupervisor) {
    // Existing channel
    const channel = socketsupervisor.getChannel(pusher.chanId);
    // Write
    sink$ = xstream_1.default.create({
        start: (listener) => {
            channel.send(pusher.event, pusher.payload);
        },
        stop: () => { }
    });
    sink$.addListener({
        next: () => { },
        error: () => { },
        complete: () => { }
    });
    // Add context to this channel stream
    return Object.defineProperty(sink$, 'name', {
        value: channel.name,
        writable: false
    });
}
/**
 * Reacts to different envelopes.
 * Handle socket creation, channel creation and WRITE / OUT effects
 * @param envelope Compose
 * @param socketsupervisor SocketSupervision
 * @return Stream<any|Channel>
 */
function compose$(envelope, socketsupervisor) {
    // Sink
    let sink$ = xstream_1.default.never();
    try {
        // Invalid envelope
        if (!envelope) {
            return adapt_1.adapt(sink$);
        }
        // Socket compose
        if (envelope.socket) {
            composeSocket(envelope.socket, socketsupervisor);
        }
        // Channel compose
        if (envelope.channel) {
            sink$ = composeChannel(envelope.channel, sink$, socketsupervisor);
        }
        // Channel WRITE
        if (envelope.pusher) {
            pusher(envelope.pusher, sink$, socketsupervisor);
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        return adapt_1.adapt(sink$);
    }
}
/**
 * Creates Phoenix WS driver
 */
function makePhoenixWSDriver() {
    // Socket supervision
    const socketsupervisor = new socket_supervisor_1.SocketSupervisor;
    /**
     * Maps Stream<Compose> messages to handler to act as a control point for sockets and channels
     * @param sink$ Stream<Compose>
     * @param name string
     */
    function phoenixWSDriver(sink$, name = 'PhoenixWS') {
        // Maps messages to socket events
        const envelopes$ = sink$.map((s) => compose$(s, socketsupervisor));
        envelopes$.addListener({
            next: (listener) => undefined,
            error: () => undefined,
            complete: () => undefined
        });
        // Source
        return new phoenix_source_1.MakePhoenixWSSource(socketsupervisor, envelopes$);
    }
    return phoenixWSDriver;
}
exports.makePhoenixWSDriver = makePhoenixWSDriver;
//# sourceMappingURL=index.js.map