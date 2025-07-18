
import { ModelWebSocketService } from './ModelWebSocketService';
import { ChatConfig } from '@/components/agents/modelComparison/types';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  failureCount: number;
  lastAttempt: number;
}

export class WebSocketConnectionManager {
  private connections: Map<number, ModelWebSocketService> = new Map();
  private connectionStates: Map<number, ConnectionState> = new Map();
  private maxFailures = 3;
  private connectionDelay = 2000; // 2 seconds between connections
  private isInitializing = false;
  private cleanup: (() => void) | null = null;

  async initializeConnections(
    agentId: string,
    numModels: number,
    chatConfigs: ChatConfig[],
    callbacks: {
      onMessage: (index: number, message: any) => void;
      onTypingStart: (index: number) => void;
      onTypingEnd: (index: number) => void;
      onError: (index: number, error: string) => void;
      onConnectionChange: (index: number, status: boolean) => void;
      onQuerySent?: (index: number, queryData: any) => void;
      onResponseReceived?: (index: number, responseData: any) => void;
    }
  ): Promise<ModelWebSocketService[]> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log('WebSocket initialization already in progress');
      return Array.from(this.connections.values());
    }

    this.isInitializing = true;
    console.log(`Initializing ${numModels} WebSocket connections for agent ${agentId}`);

    try {
      // Clean up existing connections first
      await this.cleanup();

      const newConnections: ModelWebSocketService[] = [];

      // Initialize connections sequentially with proper delays
      for (let i = 0; i < numModels; i++) {
        const connectionState = this.connectionStates.get(i) || {
          isConnected: false,
          isConnecting: false,
          failureCount: 0,
          lastAttempt: 0
        };

        // Circuit breaker: skip if too many failures
        if (connectionState.failureCount >= this.maxFailures) {
          console.log(`Skipping connection ${i} due to circuit breaker`);
          continue;
        }

        // Rate limiting: ensure minimum delay between attempts
        const timeSinceLastAttempt = Date.now() - connectionState.lastAttempt;
        if (timeSinceLastAttempt < this.connectionDelay) {
          const waitTime = this.connectionDelay - timeSinceLastAttempt;
          console.log(`Waiting ${waitTime}ms before connecting to model ${i}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        connectionState.isConnecting = true;
        connectionState.lastAttempt = Date.now();
        this.connectionStates.set(i, connectionState);

        try {
          const ws = await this.createConnection(i, agentId, chatConfigs[i], callbacks);
          newConnections[i] = ws;
          this.connections.set(i, ws);
          
          connectionState.isConnecting = false;
          connectionState.isConnected = true;
          connectionState.failureCount = 0;
          
          console.log(`Successfully connected model ${i}`);
        } catch (error) {
          console.error(`Failed to connect model ${i}:`, error);
          
          connectionState.isConnecting = false;
          connectionState.failureCount++;
          
          callbacks.onError(i, `Connection failed: ${error}`);
        }

        this.connectionStates.set(i, connectionState);

        // Delay between connections to prevent server overload
        if (i < numModels - 1) {
          await new Promise(resolve => setTimeout(resolve, this.connectionDelay));
        }
      }

      return newConnections;
    } finally {
      this.isInitializing = false;
    }
  }

  private async createConnection(
    index: number,
    agentId: string,
    config: ChatConfig,
    callbacks: any
  ): Promise<ModelWebSocketService> {
    return new Promise((resolve, reject) => {
      const ws = new ModelWebSocketService(agentId, config, index);
      
      // Set history callbacks if provided
      if (callbacks.onQuerySent && callbacks.onResponseReceived) {
        ws.setHistoryCallbacks(
          (queryData) => callbacks.onQuerySent(index, queryData),
          (responseData) => callbacks.onResponseReceived(index, responseData)
        );
      }

      let connectionTimeout: NodeJS.Timeout;
      let isResolved = false;

      const handleConnection = (status: boolean) => {
        if (isResolved) return;
        
        callbacks.onConnectionChange(index, status);
        
        if (status) {
          clearTimeout(connectionTimeout);
          isResolved = true;
          resolve(ws);
        }
      };

      const handleError = (error: string) => {
        if (isResolved) return;
        
        clearTimeout(connectionTimeout);
        isResolved = true;
        callbacks.onError(index, error);
        reject(new Error(error));
      };

      // Set up event handlers
      ws.on({
        onMessage: (message) => callbacks.onMessage(index, message),
        onTypingStart: () => callbacks.onTypingStart(index),
        onTypingEnd: () => callbacks.onTypingEnd(index),
        onError: handleError,
        onConnectionChange: handleConnection
      });

      // Connection timeout
      connectionTimeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          ws.disconnect();
          reject(new Error('Connection timeout'));
        }
      }, 10000); // 10 second timeout

      ws.connect();
    });
  }

  updateConfig(index: number, config: ChatConfig) {
    const ws = this.connections.get(index);
    if (ws) {
      ws.updateConfig(config);
    }
  }

  sendMessage(index: number, message: string) {
    const ws = this.connections.get(index);
    if (ws && this.connectionStates.get(index)?.isConnected) {
      ws.sendMessage(message);
    }
  }

  isConnected(index: number): boolean {
    return this.connectionStates.get(index)?.isConnected || false;
  }

  getConnectedCount(): number {
    return Array.from(this.connectionStates.values())
      .filter(state => state.isConnected).length;
  }

  async cleanup() {
    console.log('Cleaning up WebSocket connections');
    
    const cleanupPromises: Promise<void>[] = [];
    
    this.connections.forEach((ws, index) => {
      cleanupPromises.push(
        new Promise(resolve => {
          if (ws) {
            ws.disconnect();
            setTimeout(resolve, 100); // Small delay to ensure cleanup
          } else {
            resolve();
          }
        })
      );
    });

    await Promise.all(cleanupPromises);
    
    this.connections.clear();
    this.connectionStates.clear();
    this.isInitializing = false;
  }

  resetCircuitBreaker(index: number) {
    const state = this.connectionStates.get(index);
    if (state) {
      state.failureCount = 0;
      this.connectionStates.set(index, state);
    }
  }
}
