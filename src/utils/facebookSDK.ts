
/**
 * Facebook SDK utility functions
 * This file handles initialization and interactions with Facebook JS SDK
 */

// Facebook App ID - this should be from environment variables in production
const FACEBOOK_APP_ID = '997995855245048'; // Replace with your actual Facebook App ID
const CONFIG_ID = '905532135022526';

// Required permissions for WhatsApp Business API
const WHATSAPP_PERMISSIONS = [
  'whatsapp_business_management',  // Changed from whatsapp_business_management
  'whatsapp_business_messaging',      // Added standard business permission
  'business_management'       // Added to access business assets
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

/**
 * Initialize the Facebook SDK
 * @returns Promise that resolves when SDK is initialized
 */
export const initFacebookSDK = (): Promise<void> => {
  // If already initialized, return resolved promise
  if (sdkStatus.initialized) {
    return Promise.resolve();
  }

  // If currently loading, return a promise that waits for completion
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
    // Add the Facebook SDK script to the document
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Initialize the SDK with your app ID
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v20.0'
      });
      
      sdkStatus.initialized = true;
      sdkStatus.loading = false;
      console.log('Facebook SDK initialized');
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
export const loginWithFacebook = (): Promise<FB.LoginStatusResponse> => {
  return new Promise((resolve, reject) => {
    initFacebookSDK()
      .then(() => {
        window.FB.login((response) => {
          if (response.authResponse) {
            console.log('Facebook login successful', response);
            resolve(response);
          } else {
            console.error('Facebook login failed', response);
            reject(new Error('User cancelled login or did not fully authorize'));
          }
        }, { 
          scope: WHATSAPP_PERMISSIONS.join(',')
        });
      })
      .catch(reject);
  });
};

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
 * Get WhatsApp Business accounts associated with the logged-in user
 * @returns Promise with WhatsApp Business accounts
 */
export const getWhatsAppBusinessAccounts = (fb_token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // First, get the user's accounts/pages
    window.FB.api('/me/businesses, (accountsResponse) => {
      if (accountsResponse.error) {
        console.error('Error getting Facebook pages:', accountsResponse.error);
        reject(new Error(accountsResponse.error.message));
        return;
      }
      
      console.log('Facebook pages/accounts:', accountsResponse);
      
      // For demo purposes, we'll just return the accounts as if they were WhatsApp business accounts
      // In a real implementation, you'd need to query each page for its WhatsApp Business Account
      const businessAccounts = accountsResponse.data?.map((page: any) => ({
        id: page.id,
        name: page.name
      })) || [];
      
      console.log('Mapped business accounts:', businessAccounts);
      resolve(businessAccounts);
    });
  });
};

/**
 * Get WhatsApp Business phone numbers for a specific business account
 * @param businessAccountId The WhatsApp Business Account ID
 * @returns Promise with phone numbers
 */
export const getWhatsAppPhoneNumbers = (businessAccountId: string,fb_token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // This is a workaround since we may not have actual access to the WhatsApp Business API
    // In a real implementation, you would call:
    // window.FB.api(`/${businessAccountId}/phone_numbers`, ...)
    
    // For demonstration purposes, return mock phone numbers
    window.FB.api(
      `/${businessAccountId}/phone_numbers`,
      'GET',
      (response) => {
        if (response.error) {
          console.error('Error fetching phone numbers:', response.error);
          reject(response.error);
        } else {
          console.log('Real WhatsApp phone numbers:', response.data);
          resolve(response.data);
        }
      }
    );
    setTimeout(() => {
      const mockPhoneNumbers = [{
        id: `phone_${businessAccountId}`,
        display_phone_number: "+1234567890",
        verified_name: "Demo Business",
        quality_rating: "GREEN"
      }];
      
      console.log('Mock WhatsApp phone numbers:', mockPhoneNumbers);
      resolve(mockPhoneNumbers);
    }, 500);
  });
  
};

/**
 * Register a webhook for WhatsApp Business API
 * @param businessAccountId The WhatsApp Business Account ID
 * @param webhookUrl The URL where webhooks will be sent
 * @returns Promise with webhook registration response
 */
export const registerWhatsAppWebhook = (
  businessAccountId: string, 
  webhookUrl: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // In a real implementation with full API access, you would use:
    // window.FB.api(`/${businessAccountId}/subscribed_apps`, 'POST', {...})
    
    // For demonstration purposes, simulate a successful webhook registration
    setTimeout(() => {
      const mockResponse = {
        success: true,
        webhook_url: webhookUrl
      };
      
      console.log('Mock webhook registration:', mockResponse);
      resolve(mockResponse);
    }, 500);
  });
};
