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

  connect(token?: string) {
    
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('Socket already connecting');
      return;
    }

    this.isConnecting = true;
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnecting = false;
      this.emitToListeners('connect', null);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emitToListeners('disconnect', null);
    });

    this.socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
      this.isConnecting = false;
    });

    this.socket.on('response-count-update', (data) => {
    console.log('🔔 RESPONSE COUNT UPDATE RECEIVED:', data);
    this.emitToListeners('response-count-update', data);
  });
  
  this.socket.on('debug-message', (data) => {
    console.log('🐛 Debug message:', data);
  });
  
  this.socket.on('connection-confirmed', (data) => {
    console.log('✅ Connection confirmed:', data);
  });

    this.socket.on('analytics-update', (data) => {
      console.log('Analytics update received:', data);
      this.emitToListeners('analytics-update', data);
    });
   
  }

  joinPollRoom(pollId: string) {
    if (this.socket && this.socket.connected) {
      console.log(`Joining poll room: poll_${pollId}`);
      this.socket.emit('join-poll', pollId);
    } else {
      console.log('Socket not connected, cannot join room');
    }
  }

  leavePollRoom(pollId: string) {
    if (this.socket && this.socket.connected) {
      console.log(`Leaving poll room: poll_${pollId}`);
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
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
  }

  private emitToListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();