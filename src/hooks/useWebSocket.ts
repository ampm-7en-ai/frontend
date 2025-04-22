
import { useEffect } from 'react';
import websocketService from '@/services/websocket';

export const useAgentTrainingStatus = (
  agentId: string,
  onUpdate?: (data: any) => void
) => {
  useEffect(() => {
    if (!agentId) return;

    const unsubscribe = websocketService.subscribeToAgentTraining(
      agentId,
      onUpdate || (() => {})
    );

    return () => {
      unsubscribe();
    };
  }, [agentId, onUpdate]);
};

export const useKnowledgeBaseTrainingStatus = (
  knowledgeBaseId: number,
  onUpdate?: (data: any) => void
) => {
  useEffect(() => {
    if (!knowledgeBaseId) return;

    const unsubscribe = websocketService.subscribeToKnowledgeTraining(
      knowledgeBaseId,
      onUpdate || (() => {})
    );

    return () => {
      unsubscribe();
    };
  }, [knowledgeBaseId, onUpdate]);
};

export const useWebSocketConnection = () => {
  return {
    reconnect: websocketService.reconnect.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService)
  };
};
