"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstream_1 = require("xstream");
const adapt_1 = require("@cycle/run/lib/adapt");
class Event {
    constructor(fn) {
        this.fn = fn;
        /**
         * Name of event
         */
        this._eventName = '';
    }
    /**
     * Getter for eventName
     */
    get eventName() {
        return this._eventName;
    }
    /**
     * Handles events
     * @param event string
     * @return Stream<any>
     */
    events(event) {
        // Event name
        this._eventName = event;
        return xstream_1.default.create({
            /**
             * Start stream
             */
            start: (listener) => this.fn(this, listener),
            /**
             * Stop stream
             */
            stop: () => undefined
        });
    }
}
/**
 * Manages socket and channel sources using SocketSupervisor
 */
class MakePhoenixWSSource {
    constructor(_socketsupervisor, _envelopes$) {
        this._socketsupervisor = _socketsupervisor;
        this._envelopes$ = _envelopes$;
    }
    /**
    * Manages creation of start stream for handling channels
    * @param chanId string
    * @returns Event
    */
    select(chanId) {
        return new Event((event, listener) => this
            .handle(event, listener, chanId));
    }
    /**
     * Handles event stream
     * @param event Event
     * @param listener Listener<any>
     * @param chanId String
     * @returns void
     */
    handle(event, listener, chanId) {
        // Subscribe to interested channel
        const channel$ = adapt_1.adapt(this._envelopes$
            .filter((chan) => chan && chan.name === chanId));
        // Listen to events
        channel$.addListener({
            next: () => {
                // Retrieve interested channel
                const channel = this._socketsupervisor.getChannel(chanId);
                // Add listener
                channel.on(event.eventName, (message) => listener.next(message));
            },
            error: () => { },
            complete: () => { }
        });
    }
}
exports.MakePhoenixWSSource = MakePhoenixWSSource;
//# sourceMappingURL=phoenix-source.js.map