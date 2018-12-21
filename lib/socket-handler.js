"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Handles socket and channels lifetime
 */
class SocketSupervisor {
    constructor() {
        this.sockets = new Map();
        this.channels = new Map();
    }
    /**
     * Sets new socket
     * @param name string
     * @param socket Socket
     */
    setSocket(name, socket) {
        // const sock = new Socket(socket.url, { params: socket.params });
        this.sockets.set(name, socket);
        // sock.connect();
    }
    /**
     * Retrieves existing socket
     * @param name string
     * @returns Socket
     */
    getSocket(name) {
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
    setChannel(name, channel) {
        this.channels.set(name, channel);
    }
    /**
     * Retrieves existing channel
     * @param name string
     * @returns Channel
     */
    getChannel(name) {
        // Check to see if channel exists
        if (!this.channels.has(name)) {
            throw new Error(`A channel with id "${name}" does not exist. Please compose one before attempting to use it.`);
        }
        return this.channels.get(name);
    }
}
exports.SocketHandler = new SocketSupervisor;
//# sourceMappingURL=socket-handler.js.map