import xs, { Listener, Stream } from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { SocketSupervision, Compose, Channel, PhoenixWSSource, EventSource } from "./interfaces";

class Event implements EventSource {
    /**
     * Name of event
     */
    private _eventName: string = '';

    constructor(private readonly fn: Function) { }

    /**
     * Getter for eventName
     */
    get eventName(): string {
        return this._eventName;
    }

    /**
     * Handles events
     * @param event string
     * @return Stream<any>
     */
    events(event: string): Stream<any> {
        // Event name
        this._eventName = event;

        return xs.create({
            /**
             * Start stream
             */
            start: (listener: Listener<any>): void => this.fn(this, listener),

            /**
             * Stop stream
             */
            stop: () => undefined
        })
    }
}

/**
 * Manages socket and channel sources using SocketSupervisor
 */
export class MakePhoenixWSSource implements PhoenixWSSource {
    constructor(
        private readonly _socketsupervisor: SocketSupervision,
        private readonly _envelopes$: Stream<any|Channel>
    ) { }
    
    /**
    * Manages creation of start stream for handling channels
    * @param chanId string
    * @returns Event
    */
    select(chanId: string): EventSource {
        return new Event((event: EventSource, listener: Listener<any>) => this
            .handle(event, listener, chanId)
        );
    }

    /**
     * Handles event stream
     * @param event Event
     * @param listener Listener<any>
     * @param chanId String
     * @returns void
     */
    handle(event: EventSource, listener: Listener<any>, chanId: string): void {
        // Subscribe to interested channel
        const channel$ = adapt(this._envelopes$
            .filter((chan: Channel) => chan && chan.name === chanId)
        );

        // Listen to events
        channel$.addListener({
            next: () => {
                // Retrieve interested channel
                const channel = this._socketsupervisor.getChannel(chanId);

                // Add listener
                channel.on(event.eventName, (message: any) => listener.next(message));
            },

            error: (): void => { },
            complete: (): void => { }
        });
    }
}
