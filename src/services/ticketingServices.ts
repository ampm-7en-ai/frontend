
import { getAccessToken, getApiUrl } from '@/utils/api-config';

export interface TicketData {
  subject: string;
  content: string;
  priority: string;
  conversation?: any;
}

export interface TicketResponse {
  success: boolean;
  ticketId?: string;
  ticketUrl?: string;
  message: string;
}

export const createHubSpotTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const payload = {
    ticket_data: {
      properties: {
        subject: ticketData.subject,
        content: ticketData.content,
        hs_ticket_priority: ticketData.priority
      }
    }
  };

  const response = await fetch(getApiUrl('hubspot/ticket/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create HubSpot ticket: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'success') {
    return {
      success: true,
      ticketId: result.data.ticket_id,
      message: `HubSpot ticket #${result.data.ticket_id} created successfully`
    };
  } else {
    throw new Error(result.message || 'Failed to create HubSpot ticket');
  }
};

export const createZendeskTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const payload = {
    ticket: {
      subject: ticketData.subject,
      comment: {
        body: ticketData.content
      },
      priority: ticketData.priority,
      type: 'question'
    }
  };

  const response = await fetch(getApiUrl('zendesk/ticket/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create Zendesk ticket: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.success) {
    return {
      success: true,
      ticketId: result.ticket.id,
      ticketUrl: result.ticket.url,
      message: `Zendesk ticket #${result.ticket.id} created successfully`
    };
  } else {
    throw new Error(result.message || 'Failed to create Zendesk ticket');
  }
};

export const createFreshdeskTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const payload = {
    subject: ticketData.subject,
    description: ticketData.content,
    priority: parseInt(ticketData.priority),
    status: 2, // Open
    type: 'Question'
  };

  const response = await fetch(getApiUrl('freshdesk/ticket/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create Freshdesk ticket: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.id) {
    return {
      success: true,
      ticketId: result.id.toString(),
      message: `Freshdesk ticket #${result.id} created successfully`
    };
  } else {
    throw new Error('Failed to create Freshdesk ticket');
  }
};

export const createZohoTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const payload = {
    subject: ticketData.subject,
    description: ticketData.content,
    priority: ticketData.priority,
    status: 'Open',
    channel: 'Web'
  };

  const response = await fetch(getApiUrl('zoho/ticket/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create Zoho ticket: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.id) {
    return {
      success: true,
      ticketId: result.ticketNumber,
      message: `Zoho Desk ticket #${result.ticketNumber} created successfully`
    };
  } else {
    throw new Error('Failed to create Zoho ticket');
  }
};

export const createSalesforceTicket = async (ticketData: TicketData): Promise<TicketResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const payload = {
    Subject: ticketData.subject,
    Description: ticketData.content,
    Priority: ticketData.priority,
    Status: 'New',
    Origin: 'Web'
  };

  const response = await fetch(getApiUrl('salesforce/case/create/'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create Salesforce case: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.id) {
    return {
      success: true,
      ticketId: result.CaseNumber,
      message: `Salesforce case #${result.CaseNumber} created successfully`
    };
  } else {
    throw new Error('Failed to create Salesforce case');
  }
};

// Main ticket creation dispatcher
export const createTicket = async (providerId: string, ticketData: TicketData): Promise<TicketResponse> => {
  switch (providerId) {
    case 'hubspot':
      return createHubSpotTicket(ticketData);
    case 'zendesk':
      return createZendeskTicket(ticketData);
    case 'freshdesk':
      return createFreshdeskTicket(ticketData);
    case 'zoho':
      return createZohoTicket(ticketData);
    case 'salesforce':
      return createSalesforceTicket(ticketData);
    default:
      throw new Error(`Unsupported ticketing provider: ${providerId}`);
  }
};
