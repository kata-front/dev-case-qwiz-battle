import { io, type Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

class SocketManager {
    private socket: Socket | null = null;

    public connect(): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);
        }

        return this.socket;
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect(): void {
        if (!this.socket) {
            return;
        }

        this.socket.disconnect();
        this.socket = null;
    }
}

export const socketManager = new SocketManager();