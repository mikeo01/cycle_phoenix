import { Listener, Stream } from "xstream";
import {
    Socket as PhoenixSocket,
    Channel as PhoenixChannel
} from 'phoenix';

/**
 * Socket handler interface
 */
export interface SocketSupervision {
    /**
     * Sets new socket
     * @param name string
     * @param socket Socket
     */
    setSocket(name: string, socket: any): void;
    /**
     * Retrieves existing socket
     * @param name string
     * @returns Socket
     */
    getSocket(name: string): Socket;
    /**
     * Sets new channel
     * @param name string
     * @param channel Channel
     */
    setChannel(name: string, channel: any): void;
    /**
     * Retrieves existing channel
     * @param name string
     * @returns Channel
     */
    getChannel(name: string): Channel;
}

/**
 * PhoenixWS Source interface
 */
export interface PhoenixWSSource {
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
     * @returns void
     */
    handle(event: EventSource, listener: Listener<any>): void;
}

/**
 * Event interface
 */
export interface EventSource {
    readonly eventName: string;

    /**
     * Handles events
     * @param event string
     * @returns Stream<any>
     */
    events(event: string): Stream<any>;
}

export interface Socket {
    /**
     * Name of socket
     */
    name: string;

    /**
     * Reference to underlying Phoenix Socket
     */
    phoenix_socket: PhoenixSocket;
}

/**
 * Channel interface
 */
export interface Channel {
    /**
     * Name of channel id
     */
    name: string;

    /**
     * Phoenix channel topic
     */
    topic: string;

    /**
     * Reference to underlying Phoenix Channel
     */
    phoenix_channel: PhoenixChannel;

    /**
     * Sends payload over channel with event type
     * @param event string
     * @param req any|null
     */
    send(event: string, req: any|null): void;

    /**
     * Responds to channel events
     * @param event string
     * @param fn Function
     */
    on(event: string, fn: Function): void;
}

/**
 * Socket creation parameters
 */
export interface ComposeSocket {
    /**
     * Name of socket
     */
    name: string;

    /**
     * Endpoint (ws / wss)
     */
    url: string;

    /**
     * Parameters for socket connection
     */
    params: any|null
}

/**
 * Channel creation parameters interface
 */
export interface ComposeChannel {
    /**
     * Name of channel
     */
    name: string;

    /**
     * Phoenix channel topic
     */
    topic: string;
    
    /**
     * Socket identifier this channel relates to
     */
    socketId: string;

    /**
     * Parameters for channel connection
     */
    params: any | null
}

/**
 * Pusher interface
 */
export interface Pusher {
    /**
     * Channel identifier
     */
    chanId: string;

    /**
     * Event to Push on
     */
    event: string;

    /**
     * Payload to Push with
     */
    payload: any | null;
}

/**
 * Socket & Channel composition messages interface
 */
export interface Compose {
    /**
     * Socket parameters with which to compose
     */
    socket?: ComposeSocket;

    /**
     * Channel parameters with which to compose
     */
    channel?: ComposeChannel;

    /**
     * Pusher / WRITE / OUT to channel
     */
    pusher?: Pusher;
}
