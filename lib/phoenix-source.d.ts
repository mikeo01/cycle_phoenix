import { Listener, Stream } from "xstream";
import { SocketSupervision, Channel, PhoenixWSSource, EventSource } from "./interfaces";
/**
 * Manages socket and channel sources using SocketSupervisor
 */
export declare class MakePhoenixWSSource implements PhoenixWSSource {
    private readonly _socketsupervisor;
    private readonly _envelopes$;
    constructor(_socketsupervisor: SocketSupervision, _envelopes$: Stream<any | Channel>);
    /**
    * Manages creation of start stream for handling channels
    * @param chanId string
    * @returns Event
    */
    select(chanId: string): EventSource;
    /**
     * Handles event stream
     * @param event Event
     * @param listener Listener<any>
     * @param chanId String
     * @returns void
     */
    handle(event: EventSource, listener: Listener<any>, chanId: string): void;
}
