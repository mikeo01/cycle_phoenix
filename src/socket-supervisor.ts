import { SocketSupervision, Socket, Channel } from './interfaces';

/**
 * Handles socket and channels lifetime
 */
export class SocketSupervisor implements SocketSupervision {
    private sockets: Map<string, any> = new Map<string, any>();
    private channels: Map<string, any> = new Map<string, any>();

    /**
     * Sets new socket
     * @param name string
     * @param socket Socket
     */
    setSocket(name: string, socket: Socket) {
        this.sockets.set(name, socket);
    }

    /**
     * Retrieves existing socket
     * @param name string
     * @returns Socket
     */
    getSocket(name: string): Socket {
        // Check to see if socket exists
        if (!this.sockets.has(name)) {
            throw new Error(`A socket with id "${name}" does not exist. Please compose one before attempting to use it.`);
        }

        return this.sockets.get(name);
    }

    /**
     * Sets new channel
     * @param name string
     * @param channel Channel
     */
    setChannel(name: string, channel: Channel) {
        this.channels.set(name, channel);
    }

    /**
     * Retrieves existing channel
     * @param name string
     * @returns Channel
     */
    getChannel(name: string): Channel {
        // Check to see if channel exists
        if (!this.channels.has(name)) {
            throw new Error(`A channel with id "${name}" does not exist. Please compose one before attempting to use it.`);
        }

        return this.channels.get(name);
    }
}
