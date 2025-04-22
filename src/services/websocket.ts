
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/utils/api-config';
import { getAccessToken } from '@/utils/api-config';

// Convert http/https to ws/wss for WebSocket connection
const getWebSocketUrl = () => {
  const apiUrl = BASE_URL.replace(/^http(s?):\/\//, '');
  const protocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${apiUrl}`;
};

interface TrainingStatusUpdate {
  agentId?: string;
  knowledgeBaseId?: number;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
  timestamp: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    const token = getAccessToken();
    if (!token) {
      console.error('Cannot initialize WebSocket: No authentication token available');
      return;
    }

    try {
      this.socket = io(getWebSocketUrl(), {
        transports: ['websocket'],
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error(`Failed to connect after ${this.maxReconnectAttempts} attempts`);
      }
    });

    // Listen for training status updates
    this.socket.on('agent:training-status', (data: TrainingStatusUpdate) => {
      this.notifyListeners('agent:training-status', data);
      this.notifyListeners(`agent:training-status:${data.agentId}`, data);
    });

    this.socket.on('knowledge:training-status', (data: TrainingStatusUpdate) => {
      this.notifyListeners('knowledge:training-status', data);
      this.notifyListeners(`knowledge:training-status:${data.knowledgeBaseId}`, data);
    });
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  public subscribe<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(callback);

    // Return unsubscribe function
    return () => {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  public subscribeToAgentTraining(agentId: string, callback: (data: TrainingStatusUpdate) => void): () => void {
    return this.subscribe<TrainingStatusUpdate>(`agent:training-status:${agentId}`, callback);
  }

  public subscribeToKnowledgeTraining(knowledgeBaseId: number, callback: (data: TrainingStatusUpdate) => void): () => void {
    return this.subscribe<TrainingStatusUpdate>(`knowledge:training-status:${knowledgeBaseId}`, callback);
  }

  public reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initSocket();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
