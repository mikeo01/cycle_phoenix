import { Driver } from "@cycle/run";
import { adapt } from "@cycle/run/lib/adapt";
import xs, { Stream, Listener } from "xstream";
import { SocketSupervisor } from "./socket-supervisor";
import { Socket, Channel } from "phoenix";
import { SocketSupervision, Compose, Pusher, ComposeSocket, ComposeChannel, PhoenixWSSource } from "./interfaces";
import { MakePhoenixWSSource } from "./phoenix-source";

/**
 * Composes socket with SocketSupervisor state manager
 * @param socket ComposeSocket
 * @param socketsupervisor SocketSupervision
 * @returns void
 */
function composeSocket(socket: ComposeSocket, socketsupervisor: SocketSupervision): void {
    const phoenixSock = new Socket(socket.url, { params: socket.params });

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
function composeChannel(channelOpts: ComposeChannel, sink$: Stream<any | Channel>, socketsupervisor: SocketSupervision): Stream<Channel> {
    const socket = socketsupervisor.getSocket(channelOpts.socketId);
    const phoenixChan = socket.phoenix_socket.channel(channelOpts.topic, channelOpts.params);

    // Channel construction
    const channel = {
        name: channelOpts.name,
        topic: channelOpts.topic,
        socket: socket,
        phoenix_chan: phoenixChan,
        send: (event: string, message: any) => channel.phoenix_chan.push(event, message),
        on: (event: string, fn: Function) => channel.phoenix_chan.on(event, (resp) => fn(resp))
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
function pusher(pusher: Pusher, sink$: Stream<any|Channel>, socketsupervisor: SocketSupervision): Stream<Channel> {
    // Existing channel
    const channel = socketsupervisor.getChannel(pusher.chanId);

    // Write
    sink$ = xs.create({
        start: (listener: Listener<any>): void => {
            channel.send(pusher.event, pusher.payload);
        },

        stop: (): void => { }
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
function compose$(envelope: Compose, socketsupervisor: SocketSupervision): Stream<any|Channel> {
    // Sink
    let sink$: Stream<any|Channel> = xs.never();

    try {
        // Invalid envelope
        if (!envelope) {
            return adapt(sink$);
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
            sink$ = pusher(envelope.pusher, sink$, socketsupervisor);
        }
    } catch (e) {
        console.error(e);
    } finally {
        return adapt(sink$);
    }
}

/**
 * Creates Phoenix WS driver
 */
export function makePhoenixWSDriver() {
    // Socket supervision
    const socketsupervisor = new SocketSupervisor;

    /**
     * Maps Stream<Compose> messages to handler to act as a control point for sockets and channels
     * @param sink$ Stream<Compose>
     * @param name string
     */
    function phoenixWSDriver(sink$: Stream<Compose>, name: string = 'PhoenixWS'): PhoenixWSSource {
        // Maps messages to socket events
        const envelopes$ = sink$.map((s: Compose) => compose$(s, socketsupervisor));

        envelopes$.addListener({
            next: (listener: any) => undefined,
            error: () => undefined,
            complete: () => undefined
        });

        // Source
        return new MakePhoenixWSSource(socketsupervisor, envelopes$);
    }

    return phoenixWSDriver as any;
}

export {PhoenixWSSource} from './interfaces';
