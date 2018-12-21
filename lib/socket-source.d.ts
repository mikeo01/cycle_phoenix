import { Stream } from "xstream";
import { SocketSupervision, Channel } from "./interfaces";
declare class Event {
    private readonly fn;
    /**
     * Name of event
     */
    private _eventName;
    constructor(fn: Function);
    /**
     * Getter for eventName
     */
    readonly eventName: string;
    /**
     * Handles events
     * @param event string
     */
    events(event: string): Stream<any>;
}
/**
 * Managers socket and channel sources using SocketSupervisor
 */
export declare class PhoenixWSSource {
    private readonly _socketsupervisor;
    private readonly _envelopes$;
    /**
     * Channel identifier
     */
    private _chanId;
    constructor(_socketsupervisor: SocketSupervision, _envelopes$: Stream<any | Channel>);
    /**
    * Manages creation of start stream for handling channels
    * @param chanId string
    * @returns any
    */
    select(chanId: string): Event;
    /**
     * Handles event stream
     * @param event Event
     * @param listener any
     */
    handle(event: Event, listener: any): void;
}
export {};
