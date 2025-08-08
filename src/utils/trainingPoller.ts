
import { BASE_URL, getAccessToken } from '@/utils/api-config';

let currentPollingInterval: NodeJS.Timeout | null = null;
let currentAgentId: string | null = null;

export interface PollCallback {
  (status: 'Active' | 'Training' | 'Issues', message?: string): void;
}

export const startPollingAgent = (agentId: string, callback: PollCallback) => {
  console.log(`Starting simple polling for agent ${agentId}`);
  
  // Stop any existing polling
  stopPollingAgent();
  
  currentAgentId = agentId;
  
  const poll = async () => {
    const token = getAccessToken();
    if (!token) {
      console.error('No token available, stopping polling');
      stopPollingAgent();
      return;
    }

    try {
      console.log(`Polling agent ${agentId} status...`);
      
      const response = await fetch(`${BASE_URL}ai/train-status/${agentId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Status response for agent ${agentId}:`, data);

      const status = data.training_status;
      callback(status, data.message);

      // Stop polling if status is final
      if (status === 'Active' || status === 'Issues') {
        console.log(`Final status '${status}' received. Stopping polling.`);
        stopPollingAgent();
      }
      
    } catch (error) {
      console.error(`Polling error for agent ${agentId}:`, error);
    }
  };

  // Start polling immediately and then every 5 seconds
  poll();
  currentPollingInterval = setInterval(poll, 5000);
};

export const stopPollingAgent = () => {
  if (currentPollingInterval) {
    console.log('Stopping polling');
    clearInterval(currentPollingInterval);
    currentPollingInterval = null;
    currentAgentId = null;
  }
};

export const isPolling = () => currentPollingInterval !== null;
export const getCurrentPollingAgent = () => currentAgentId;
