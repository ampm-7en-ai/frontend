
import { getAccessToken, getApiUrl } from '@/utils/api-config';

export interface TicketData {
  subject: string;
  content: string;
  priority: string;
  conversation?: any;
  session_id?: string;
}

export interface TicketResponse {
  success: boolean;
  ticketId?: string;
  ticketUrl?: string;
  message: string;
}

// Main ticket creation function using the new endpoint
export const createTicket = async (providerId: string, ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Convert priority string to number for the API
  let priorityNumber = 2; // default to medium
  switch (ticketData.priority.toLowerCase()) {
    case 'low':
    case '1':
      priorityNumber = 1;
      break;
    case 'medium':
    case 'normal':
    case '2':
      priorityNumber = 2;
      break;
    case 'high':
    case '3':
      priorityNumber = 3;
      break;
    case 'urgent':
    case 'critical':
    case '4':
      priorityNumber = 4;
      break;
  }

  const payload = {
    session_id: ticketData.conversation?.id || ticketData.session_id,
    subject: ticketData.subject,
    description: ticketData.content,
    //priority: priorityNumber,
    provider: providerId
  };

  const response = await fetch(getApiUrl('chat/tickets/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create ticket: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return {
      success: true,
      message: result.message
    };
  } else {
    throw new Error(result.message || 'Failed to create ticket');
  }
};

// Legacy functions kept for backwards compatibility but now use the main createTicket function
export const createHubSpotTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  return createTicket('hubspot', ticketData);
};

export const createZendeskTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  return createTicket('zendesk', ticketData);
};

export const createFreshdeskTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  return createTicket('freshdesk', ticketData);
};

export const createZohoTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  return createTicket('zoho', ticketData);
};

export const createSalesforceTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  return createTicket('salesforce', ticketData);
};
