
interface Window {
  FB: FB.FacebookStatic;
}

declare namespace FB {
  interface FacebookStatic {
    init(options: InitParams): void;
    login(callback: (response: LoginStatusResponse) => void, options?: LoginOptions): void;
    logout(callback: (response: any) => void): void;
    getLoginStatus(callback: (response: LoginStatusResponse) => void, roundtrip?: boolean): void;
    api(path: string, callback: (response: any) => void): void;
    api(path: string, method: string, callback: (response: any) => void): void;
    api(path: string, method: string, params: object, callback: (response: any) => void): void;
  }
  
  interface InitParams {
    appId: string;
    version: string;
    cookie?: boolean;
    status?: boolean;
    xfbml?: boolean;
    frictionlessRequests?: boolean;
    hideFlashCallback?: boolean;
    autoLogAppEvents?: boolean;
  }
  
  interface LoginOptions {
    auth_type?: string;
    scope?: string;
    return_scopes?: boolean;
    enable_profile_selector?: boolean;
    profile_selector_ids?: string;
  }
  
  interface AuthResponse {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    grantedScopes?: string;
    reauthorize_required_in?: number;
  }
  
  interface LoginStatusResponse {
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse: AuthResponse | null;
  }
}
