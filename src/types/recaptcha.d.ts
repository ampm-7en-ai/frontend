/**
 * Type definitions for reCAPTCHA v3
 */

interface Window {
  grecaptcha: {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
    ready: (callback: () => void) => void;
  };
}
