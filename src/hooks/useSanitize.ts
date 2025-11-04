/**
 * React Hook for HTML Sanitization
 * Uses DOMPurify to prevent XSS attacks
 */

import DOMPurify from 'dompurify';

export const useSanitize = () => {
  const sanitize = (dirty: string): string => {
    if (!dirty) return '';
    
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'br', 'p', 
        'ul', 'ol', 'li', 'code', 'pre', 'span', 
        'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
  };

  const sanitizeArray = (dirtyArray: string[]): string[] => {
    return dirtyArray.map(item => sanitize(item));
  };

  const sanitizeMarkdown = (text: string): string => {
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

  return { sanitize, sanitizeArray, sanitizeMarkdown };
};
