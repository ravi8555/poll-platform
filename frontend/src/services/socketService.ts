// frontend/src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token?: string | null): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

      this.socket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnecting = false;
        this.emitToListeners('connect', null);
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnecting = false;
        this.emitToListeners('disconnect', null);
      });

      this.socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on('response-count-update', (data) => {
        console.log('🔔 RESPONSE COUNT UPDATE RECEIVED:', data);
        this.emitToListeners('response-count-update', data);
      });

      this.socket.on('analytics-update', (data) => {
        this.emitToListeners('analytics-update', data);
      });

      this.socket.on('debug-message', (data) => {
        console.log('🐛 Debug message:', data);
      });

      this.socket.on('connection-confirmed', (data) => {
        console.log('✅ Connection confirmed:', data);
      });
    });
  }

  async joinPollRoom(pollId: string, token?: string){
    if (!this.socket?.connected) {
    await this.connect(token);
  }

  this.socket?.emit('join-poll', pollId);
  }

  // joinPollRoom(pollId: string) {
  //   if (this.socket?.connected) {
  //     this.socket.emit('join-poll', pollId);
  //   }
  // }

  leavePollRoom(pollId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-poll', pollId);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    this.listeners.set(
      event,
      callbacks.filter((cb) => cb !== callback)
    );
  }

  private emitToListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnecting = false;
  }
}

export const socketService = SocketService.getInstance();