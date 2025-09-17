/**
 * Facebook SDK utility functions
 * This file handles initialization and interactions with Facebook JS SDK
 */
import { getAccessToken } from "@/utils/api-config"
import { getFromCache, storeInCache } from "@/utils/cacheUtils";
import { FACEBOOK_APP_ID, FACEBOOK_CONFIG_ID, API_BASE_URL } from "@/config/env";

// Required permissions for WhatsApp Business API
const WHATSAPP_PERMISSIONS = [
  'whatsapp_business_management',
  'whatsapp_business_messaging',
  'business_management'
];

// Interface for SDK initialization status
interface FacebookSDKStatus {
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

// Track the SDK initialization status
let sdkStatus: FacebookSDKStatus = {
  initialized: false,
  loading: false,
  error: null
};

// Store phone_id and waba_id from the message event
let whatsappData: { phone_id?: string; waba_id?: string } = {};
let userID = JSON.parse(localStorage.getItem('user'));

// Session logging message event listener
window.addEventListener('message', (event) => {
  if (!event.origin.endsWith('facebook.com')) return;
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'WA_EMBEDDED_SIGNUP') {

      // Extract phone_id and waba_id from the event data
      if (data.data.phone_number_id && data.data.waba_id) {
        whatsappData.phone_id = data.data.phone_number_id;
        whatsappData.waba_id = data.data.waba_id;
        console.log(`Captured phone_id: ${whatsappData.phone_id}, waba_id: ${whatsappData.waba_id}`);
      }
    }
  } catch {
    
  }
});

/**
 * Initialize the Facebook SDK
 * @returns Promise that resolves when SDK is initialized
 */
export const initFacebookSDK = (): Promise<void> => {
  if (sdkStatus.initialized) {
    return Promise.resolve();
  }

  if (sdkStatus.loading) {
    return new Promise((resolve, reject) => {
      const checkStatus = setInterval(() => {
        if (sdkStatus.initialized) {
          clearInterval(checkStatus);
          resolve();
        }
        if (sdkStatus.error) {
          clearInterval(checkStatus);
          reject(new Error(sdkStatus.error));
        }
      }, 100);
    });
  }

  sdkStatus.loading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v22.0'
      });
      
      sdkStatus.initialized = true;
      sdkStatus.loading = false;
      resolve();
    };
    
    script.onerror = () => {
      const error = 'Failed to load Facebook SDK';
      sdkStatus.error = error;
      sdkStatus.loading = false;
      console.error(error);
      reject(new Error(error));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Login to Facebook and request WhatsApp Business permissions
 * @returns Promise with login response
 */
export const loginWithFacebook = (): Promise<{fbResponse: FB.LoginStatusResponse, apiResponse?: any}> => {
  return new Promise((resolve, reject) => {
    initFacebookSDK()
      .then(() => {
        const options: any = { 
          config_id: FACEBOOK_CONFIG_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: '2'
          }
        };
        window.FB.login((response) => {
          processAuthResponse(response)
            .then(resolve)
            .catch(reject);
        }, options);
      })
      .catch(reject);
  });
};

/**
 * Process the authentication response and exchange code
 */
function processAuthResponse(response: FB.LoginStatusResponse): Promise<{fbResponse: FB.LoginStatusResponse, apiResponse: any}> {
  return new Promise((resolve, reject) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      if (code && whatsappData.phone_id && whatsappData.waba_id) {
        fetch(`${API_BASE_URL}whatsapp/oauth/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            phone_id: whatsappData.phone_id,
            waba_id: whatsappData.waba_id,
            user_id: userID?.id.toString() || ""
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Backend response:', data);
          resolve({fbResponse: response, apiResponse: data});
        })
        .catch(err => {
          console.error('Error exchanging code:', err);
          reject(err);
        });
      } else {
        reject(new Error('Missing code, phone_id, or waba_id'));
      }
    } else {
      console.log('User cancelled login or did not fully authorize:', response);
      resolve({fbResponse: response, apiResponse: null});
    }
  });
}
/**
 * Check current Facebook login status
 * @returns Promise with login status
 */
export const getFacebookLoginStatus = (): Promise<FB.LoginStatusResponse> => {
  return new Promise((resolve, reject) => {
    initFacebookSDK()
      .then(() => {
        window.FB.getLoginStatus((response) => {
          console.log('Facebook login status:', response);
          resolve(response);
        });
      })
      .catch(reject);
  });
};

/**
 * Logout from Facebook
 * @returns Promise that resolves when logout is complete
 */
export const logoutFromFacebook = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!sdkStatus.initialized) {
      resolve();
      return;
    }
    
    try {
      window.FB.logout(() => {
        console.log('Logged out from Facebook');
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check WhatsApp connection status
 * @param forceRefresh Force refresh cache
 * @returns Promise with WhatsApp connection status response
 */
export const checkWhatsAppStatus = async (forceRefresh = false): Promise<{
  isLinked: boolean;
  phoneNumber?: string;
  qrCode?: string;
}> => {
  const CACHE_KEY = 'whatsapp_status';
  
  // Check cache first unless forceRefresh is true
  if (!forceRefresh) {
    const cachedStatus = getFromCache<{
      isLinked: boolean;
      phoneNumber?: string;
      qrCode?: string;
    }>(CACHE_KEY);
    
    if (cachedStatus) {
      console.log('Using cached WhatsApp status');
      return cachedStatus;
    }
  }
  
  const token = getAccessToken();
  if (!token) {
    console.error("No access token available for checkWhatsAppStatus");
    return { isLinked: false };
  }
  
  try {
    console.log('Fetching fresh WhatsApp status');
    const response = await fetch(`${API_BASE_URL}whatsapp/status/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`WhatsApp status check failed with status: ${response.status}`);
      return { isLinked: false };
    }
    
    const data = await response.json();
    console.log('WhatsApp status response:', data);
    
    // Return connection status along with phone number and QR code if available
    const statusData = {
      isLinked: data?.data?.is_linked || false,
      phoneNumber: data?.data?.phone || '',
      qrCode: data?.data?.qr || ''
    };
    
    // Store in cache for future use
    storeInCache(CACHE_KEY, statusData);
    
    return statusData;
  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    return { isLinked: false };
  }
};
