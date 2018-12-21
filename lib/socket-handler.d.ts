/**
 * Handles socket and channels lifetime
 */
declare class SocketSupervisor {
    private sockets;
    private channels;
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
    getSocket(name: string): any;
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
    getChannel(name: string): any;
}
export declare const SocketHandler: SocketSupervisor;
export {};
