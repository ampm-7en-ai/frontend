/**
 * Slack SDK utility functions
 * This file handles authentication and interactions with Slack API
 */
import { getAccessToken } from "@/utils/api-config";
import { getFromCache, storeInCache } from "@/utils/cacheUtils";

// Slack Client ID - this should be from environment variables in production
const SLACK_CLIENT_ID: string = '7892190343524.8899282845893'; // Replace with your actual Slack Client ID

// Required permissions for Slack API
const SLACK_PERMISSIONS: string[] = [
  'channels:read',
  'channels:join',
  'chat:write',
  'chat:write.public'
];

// Interface for SDK initialization status
interface SlackSDKStatus {
  authenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Interface for Slack channel data
interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_archived: boolean;
}

// Interface for Slack connection status response
interface SlackStatusResponse {
  isLinked: boolean;
  channelName?: string;
}

// Interface for Slack connection response
interface SlackConnectionResponse {
  success: boolean;
  channelName: string;
}

// Interface for user data stored in localStorage
interface User {
  id: string;
}

// Track the SDK authentication status
let sdkStatus: SlackSDKStatus = {
  authenticated: false,
  loading: false,
  error: null
};

// Store Slack authentication data
let slackData: { accessToken?: string; teamId?: string } = {};
let userID: User | null = JSON.parse(localStorage.getItem('user') || 'null');

/**
 * Authenticate with Slack and initiate OAuth flow
 * Opens Slack's authorization page in a new window
 * @returns {Window | null} The new window object or null if popup was blocked
 */
export const authenticateSlack = (): Window | null => {
  const scope: string = SLACK_PERMISSIONS.join(',');
  const redirectUri: string = `https://api.7en.ai/api/slack/callback`;
  const slackAuthUrl: string = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`;
  
  sdkStatus.loading = true;
  
  // Open in a new window instead of redirecting
  const newWindow = window.open(slackAuthUrl, 'SlackAuth', 'width=800,height=600');
  
  if (!newWindow) {
    sdkStatus.error = 'Popup was blocked by your browser. Please allow popups for this site.';
  }
  
  return newWindow;
};

/**
 * Fetch Slack channels for the authenticated workspace
 * @param accessToken The Slack access token obtained after OAuth
 * @returns Promise with an array of Slack channels
 */
export const fetchSlackChannels = async (accessToken: string): Promise<SlackChannel[]> => {
  try {
    const response = await fetch('https://slack.com/api/conversations.list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data: { ok: boolean; channels: SlackChannel[]; error?: string } = await response.json();
    if (!data.ok) {
      sdkStatus.error = data.error || 'Failed to fetch Slack channels';
      throw new Error(sdkStatus.error);
    }

    const channels: SlackChannel[] = data.channels.filter((channel: SlackChannel) => channel.is_channel && !channel.is_archived);
    console.log('Fetched Slack channels:', channels);
    return channels;
  } catch (error: any) {
    sdkStatus.error = error.message || 'Error fetching Slack channels';
    console.error(sdkStatus.error);
    throw error;
  }
};

/**
 * Connect a Slack channel to the AI agent
 * @param accessToken The Slack access token
 * @param teamId The Slack team ID
 * @param channelId The selected channel ID
 * @param channelName The selected channel name
 * @param chatbotId The ID of the chatbot to connect
 * @returns Promise with connection response
 */
export const connectSlackChannel = async (
  accessToken: string,
  teamId: string,
  channelId: string,
  channelName: string,
  chatbotId: string
): Promise<SlackConnectionResponse> => {
  try {
    const response = await fetch('https://api.7en.ai/api/slack/connect/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        teamId,
        channelId,
        channelName,
        chatbotId,
        user_id: userID?.id.toString(),
      }),
    });

    const data: { success: boolean; error?: string } = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to connect Slack channel');
    }

    slackData = { accessToken, teamId };
    sdkStatus.authenticated = true;
    sdkStatus.loading = false;
    console.log('Slack channel connected:', data);
    return { success: true, channelName };
  } catch (error: any) {
    sdkStatus.error = error.message || 'Error connecting Slack channel';
    console.error(sdkStatus.error);
    throw error;
  }
};

/**
 * Disconnect a Slack channel
 * @param channelId The ID of the channel to disconnect
 * @returns Promise that resolves when disconnection is complete
 */
export const disconnectSlackChannel = async (channelId: string): Promise<void> => {
  try {
    const response = await fetch('https://api.7en.ai/api/slack/disconnect/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelId,
        user_id: userID?.id.toString(),
      }),
    });

    const data: { success: boolean; error?: string } = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to disconnect Slack channel');
    }

    sdkStatus.authenticated = false;
    slackData = {};
    console.log('Slack channel disconnected');
  } catch (error: any) {
    sdkStatus.error = error.message || 'Error disconnecting Slack channel';
    console.error(sdkStatus.error);
    throw error;
  }
};

/**
 * Check Slack connection status
 * @param forceRefresh Force refresh cache
 * @returns Promise with Slack connection status response
 */
export const checkSlackStatus = async (forceRefresh: boolean = false): Promise<SlackStatusResponse> => {
  const CACHE_KEY: string = 'slack_status';

  // Check cache first unless forceRefresh is true
  if (!forceRefresh) {
    const cachedStatus = getFromCache<SlackStatusResponse>(CACHE_KEY);
    if (cachedStatus) {
      console.log('Using cached Slack status');
      return cachedStatus;
    }
  }

  const token: string | null = getAccessToken();
  if (!token) {
    console.error("No access token available for checkSlackStatus");
    return { isLinked: false };
  }

  try {
    console.log('Fetching fresh Slack status');
    const response = await fetch('https://api.7en.ai/api/slack/status/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Slack status check failed with status: ${response.status}`);
      return { isLinked: false };
    }

    const data: { data: { is_linked: boolean; channel_name?: string } } = await response.json();
    console.log('Slack status response:', data);

    const statusData: SlackStatusResponse = {
      isLinked: data?.data?.is_linked || false,
      channelName: data?.data?.channel_name || '',
    };

    // Store in cache for future use
    storeInCache(CACHE_KEY, statusData);

    return statusData;
  } catch (error: any) {
    console.error('Error checking Slack status:', error);
    return { isLinked: false };
  }
};
