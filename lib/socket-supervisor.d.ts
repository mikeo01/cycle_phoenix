import { SocketSupervision, Socket, Channel } from './interfaces';
/**
 * Handles socket and channels lifetime
 */
export declare class SocketSupervisor implements SocketSupervision {
    private sockets;
    private channels;
    /**
     * Sets new socket
     * @param name string
     * @param socket Socket
     */
    setSocket(name: string, socket: Socket): void;
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
    setChannel(name: string, channel: Channel): void;
    /**
     * Retrieves existing channel
     * @param name string
     * @returns Channel
     */
    getChannel(name: string): Channel;
}
