/**
 * XSS Protection Utility using DOMPurify
 * This file provides sanitization functions for vanilla JavaScript
 */

// Load DOMPurify from CDN
(function() {
  'use strict';

  // Load DOMPurify library
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js';
  script.integrity = 'sha512-M72KfQy4kPuLYC6CeTrN0eA17U1lXEMmer20esp8mpALdj3KKXr6KYKnsV9f2GNujf7K3RsDDE5ACH1Ml1SxZg==';
  script.crossOrigin = 'anonymous';
  script.referrerPolicy = 'no-referrer';
  document.head.appendChild(script);

  // Wait for DOMPurify to load, then expose sanitization function
  script.onload = function() {
    if (typeof DOMPurify !== 'undefined') {
      window.chatSanitize = function(dirty) {
        if (!dirty) return '';
        
        return DOMPurify.sanitize(dirty, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
          ALLOW_DATA_ATTR: false,
          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
      };

      // Enhanced markdown parser that escapes HTML first, then applies formatting
      window.chatParseMarkdown = function(text) {
        if (!text) return '';
        
        // First escape HTML to prevent XSS
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        // Then apply markdown formatting (which is now safe)
        return escaped
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
      };

      console.log('✅ Chat sanitization functions loaded');
    }
  };

  script.onerror = function() {
    console.error('❌ Failed to load DOMPurify. XSS protection is disabled!');
    // Fallback to basic escaping
    window.chatSanitize = function(dirty) {
      if (!dirty) return '';
      return String(dirty)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    window.chatParseMarkdown = function(text) {
      if (!text) return '';
      return window.chatSanitize(text).replace(/\n/g, '<br>');
    };
  };
})();
