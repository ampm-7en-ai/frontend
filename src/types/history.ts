
export interface SocketHistory {
  socketIndex: number;
  chatEndpoint: string; // "chat1", "chat2", "chat3"
  queries: Array<{
    id: string;
    content: string;
    timestamp: string;
    config: {
      response_model: string;
      temperature: number;
      system_prompt: string;
    };
  }>;
  responses: Array<{
    id: string;
    queryId: string; // Links to query
    content: string;
    timestamp: string;
  }>;
}

export interface HistoryItem {
  id: string;
  query: string; // The user's original query
  timestamp: Date;
  socketHistories: SocketHistory[]; // One for each active model
}

export interface QueryTracker {
  id: string;
  content: string;
  timestamp: string;
  config: any;
  responses: Array<{
    socketIndex: number;
    content: string;
    timestamp: string;
  }>;
}
