# Security Testing Guide for 7en.ai Platform

**Version:** 1.0  
**Last Updated:** 2025-10-10  
**Target Audience:** QA Engineers, Security Testers, Penetration Testers

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Pre-Testing Setup](#pre-testing-setup)
3. [Manual Security Testing](#manual-security-testing)
4. [Automated Security Testing](#automated-security-testing)
5. [Penetration Testing](#penetration-testing)
6. [Vulnerability Disclosure](#vulnerability-disclosure)

---

## Testing Overview

This guide provides comprehensive procedures for testing the security of the 7en.ai platform. All security tests should be performed in **staging environment only** unless explicitly approved for production testing.

### Testing Environments

- **Local Development:** `http://localhost:5173` (for unit tests)
- **Staging:** `https://staging.7en.ai` (for integration tests)
- **Beta:** `https://beta.7en.ai` (for pre-production tests)
- **Production:** `https://7en.ai` (restricted access)

### Testing Frequency

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Automated Unit Tests | Every commit | Developers |
| Dependency Scanning | Weekly | DevOps |
| Manual Security Tests | Before each release | QA Team |
| Penetration Testing | Quarterly | Security Team |
| Security Audit | Annually | External Auditor |

---

## Pre-Testing Setup

### Required Tools

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/user-event vitest

# Install security scanning tools
npm install -g snyk
npm install -g retire

# Browser extensions for manual testing
# - OWASP ZAP Proxy
# - Burp Suite Community Edition
# - EditThisCookie
# - ModHeader
```

### Test Accounts

Create the following test accounts in staging:

```
Regular User:
- Email: test.user@7en.ai
- Password: TestUser123!@#
- Role: USER

Admin User:
- Email: test.admin@7en.ai
- Password: TestAdmin123!@#
- Role: SUPERADMIN

Unverified User:
- Email: test.unverified@7en.ai
- Password: TestUnverified123!@#
- Status: Not verified
```

---

## Manual Security Testing

### 1. Authentication Testing

#### Test Case 1.1: Strong Password Enforcement

**Objective:** Verify password complexity requirements

**Steps:**
1. Navigate to signup page (`/signup`)
2. Attempt to create account with weak passwords:
   - `test123` (too short)
   - `password` (no uppercase, numbers, special chars)
   - `PASSWORD` (no lowercase, numbers, special chars)
   - `Test1234` (no special characters)
   - `Test!@#$` (no numbers)
   - `test123!` (no uppercase)

**Expected Result:** 
- All weak passwords should be rejected
- Clear error messages displayed
- Password field shows validation status

**Pass Criteria:** ✅ All weak passwords rejected

---

#### Test Case 1.2: OTP Verification

**Objective:** Verify OTP login flow security

**Steps:**
1. Navigate to login page
2. Click "Login with Code"
3. Enter valid email
4. Wait for OTP email
5. Test invalid OTPs:
   - `12345` (too short)
   - `1234567` (too long)
   - `abcdef` (non-numeric)
   - `000000` (invalid code)
6. Enter valid OTP
7. Verify successful login

**Expected Result:**
- Invalid OTPs rejected with clear errors
- Valid OTP allows login
- OTP expires after time limit
- OTP can only be used once

**Pass Criteria:** ✅ OTP validation works correctly

---

#### Test Case 1.3: Session Management

**Objective:** Verify token expiration and refresh

**Steps:**
1. Login to application
2. Open browser DevTools → Application → Local Storage
3. Note the `accessToken` value
4. Wait 5 minutes (near token expiration)
5. Make an authenticated API call
6. Verify token refresh occurs automatically
7. Check that new token is stored
8. Wait for complete token expiration (>30 minutes)
9. Verify automatic logout occurs

**Expected Result:**
- Token refreshes automatically before expiration
- User remains logged in during active session
- User is logged out after token expires
- Cache is cleared on logout

**Pass Criteria:** ✅ Token lifecycle works as expected

---

#### Test Case 1.4: OAuth2 SSO Security

**Objective:** Verify Google/Apple SSO security

**Steps:**
1. Navigate to login page
2. Click "Continue with Google"
3. Complete OAuth flow
4. Intercept OAuth token (use browser DevTools)
5. Verify token is validated server-side
6. Attempt to reuse expired OAuth token
7. Verify email verification status is set correctly

**Expected Result:**
- OAuth tokens validated server-side only
- Expired tokens rejected
- User profile created/updated correctly
- No client-side secret exposure

**Pass Criteria:** ✅ SSO flow is secure

---

### 2. XSS (Cross-Site Scripting) Testing

#### Test Case 2.1: Reflected XSS

**Objective:** Verify input sanitization in all forms

**Test Payloads:**
```javascript
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
```

**Test Locations:**
- Login form (username, password)
- Signup form (all fields)
- Agent creation form (name, description)
- Knowledge source upload (file names, URLs)
- Chat messages
- Search fields

**Steps:**
1. Enter XSS payload in each field
2. Submit form
3. Observe rendered output
4. Check browser console for errors

**Expected Result:**
- All payloads should be escaped/sanitized
- No JavaScript execution
- Payloads displayed as plain text

**Pass Criteria:** ✅ No XSS vulnerability detected

---

#### Test Case 2.2: Stored XSS

**Objective:** Verify persistent data is sanitized

**Steps:**
1. Create agent with name: `<script>alert('XSS')</script>`
2. Save agent
3. Navigate to agents list
4. Verify agent name is escaped
5. Click on agent to view details
6. Verify description field is escaped
7. Test Markdown content with malicious HTML

**Expected Result:**
- All stored data is sanitized on output
- Markdown rendered safely (no script execution)
- HTML entities properly escaped

**Pass Criteria:** ✅ No stored XSS vulnerability

---

#### Test Case 2.3: DOM-Based XSS

**Objective:** Verify client-side DOM manipulation is safe

**Steps:**
1. Open browser DevTools console
2. Attempt to modify DOM directly:
   ```javascript
   document.body.innerHTML = '<script>alert("XSS")</script>';
   ```
3. Check if script executes
4. Test URL fragments with XSS payloads:
   ```
   https://staging.7en.ai/#<script>alert('XSS')</script>
   ```

**Expected Result:**
- React's virtual DOM prevents direct manipulation
- URL fragments sanitized
- No script execution from DOM changes

**Pass Criteria:** ✅ No DOM XSS vulnerability

---

### 3. CSRF (Cross-Site Request Forgery) Testing

#### Test Case 3.1: CSRF Protection

**Objective:** Verify CSRF protection on state-changing operations

**Steps:**
1. Login to application
2. Copy access token from localStorage
3. Open separate browser (different origin)
4. Attempt to make API request with stolen token:
   ```html
   <!-- csrf-test.html -->
   <form action="https://api.7en.ai/api/agents/" method="POST">
     <input name="name" value="Malicious Agent">
     <input type="submit">
   </form>
   <script>
     document.forms[0].submit();
   </script>
   ```
5. Verify request fails

**Expected Result:**
- Request fails due to missing Authorization header
- Tokens in localStorage not sent automatically
- CORS policy blocks cross-origin requests

**Pass Criteria:** ✅ CSRF protection verified

---

### 4. Authorization Testing

#### Test Case 4.1: Vertical Privilege Escalation

**Objective:** Verify users cannot access admin functions

**Steps:**
1. Login as regular user
2. Note user ID and access token
3. Attempt to access admin endpoints:
   ```
   GET /api/admin/dashboard
   GET /api/admin/users
   POST /api/admin/users/{id}/promote
   ```
4. Verify 403 Forbidden responses
5. Attempt to modify user role via localStorage:
   ```javascript
   let user = JSON.parse(localStorage.getItem('user'));
   user.role = 'SUPERADMIN';
   localStorage.setItem('user', JSON.stringify(user));
   ```
6. Refresh page and attempt admin actions

**Expected Result:**
- Admin endpoints reject regular user tokens (403)
- Client-side role modification has no effect
- Server validates role from database, not client

**Pass Criteria:** ✅ No privilege escalation possible

---

#### Test Case 4.2: Horizontal Privilege Escalation

**Objective:** Verify users cannot access other users' data

**Steps:**
1. Login as User A
2. Note User A's business ID
3. Create agent as User A
4. Note agent ID from response
5. Logout and login as User B
6. Attempt to access User A's agent:
   ```
   GET /api/agents/{user_a_agent_id}
   PUT /api/agents/{user_a_agent_id}
   DELETE /api/agents/{user_a_agent_id}
   ```
7. Verify all requests fail (403/404)

**Expected Result:**
- User B cannot view/edit/delete User A's resources
- API validates resource ownership before allowing access
- Business ID isolation enforced

**Pass Criteria:** ✅ No horizontal escalation possible

---

### 5. Session Security Testing

#### Test Case 5.1: Token Theft Simulation

**Objective:** Verify token security measures

**Steps:**
1. Login to application
2. Open DevTools → Application → Local Storage
3. Copy entire `user` object (including tokens)
4. Open incognito window
5. Paste token into localStorage:
   ```javascript
   localStorage.setItem('user', '{copied_user_object}');
   ```
6. Refresh page
7. Verify if session works

**Expected Result:**
- Session works (tokens are bearer tokens)
- However, tokens expire quickly (30 min)
- Refresh token required for long sessions
- Activity monitoring should detect anomalies

**Pass Criteria:** ✅ Tokens functional but with mitigations:
- Short expiration times
- Token refresh mechanism
- Monitoring for suspicious activity

---

#### Test Case 5.2: Concurrent Session Testing

**Objective:** Verify multiple session handling

**Steps:**
1. Login on Chrome
2. Login on Firefox with same account
3. Perform actions in both browsers
4. Logout from Chrome
5. Verify Firefox session still works
6. Check if logout clears cache in both

**Expected Result:**
- Multiple sessions allowed (JWT architecture)
- Logout only affects current browser
- Cache cleared per-browser on logout

**Pass Criteria:** ✅ Multiple sessions handled correctly

---

### 6. API Security Testing

#### Test Case 6.1: API Authentication

**Objective:** Verify all API endpoints require authentication

**Steps:**
1. Use Postman/curl to call endpoints without auth:
   ```bash
   curl https://api.7en.ai/api/agents/
   curl https://api.7en.ai/api/conversations/
   curl https://api.7en.ai/api/knowledge/
   ```
2. Verify 401 Unauthorized responses
3. Add invalid token:
   ```bash
   curl -H "Authorization: Bearer invalid_token" \
        https://api.7en.ai/api/agents/
   ```
4. Verify 401 response

**Expected Result:**
- All protected endpoints return 401 without valid token
- Invalid tokens rejected
- Clear error messages

**Pass Criteria:** ✅ API authentication enforced

---

#### Test Case 6.2: API Rate Limiting

**Objective:** Verify rate limiting on sensitive endpoints

**Steps:**
1. Write script to send 100 login requests:
   ```bash
   for i in {1..100}; do
     curl -X POST https://api.7en.ai/api/auth/login/ \
          -d "username=test&password=test" &
   done
   ```
2. Verify rate limiting kicks in
3. Check response codes (429 Too Many Requests)

**Expected Result:**
- Rate limiting enforced after threshold
- 429 status code returned
- Retry-After header present

**Pass Criteria:** ⚠️ Requires backend implementation

---

### 7. Integration Security Testing

#### Test Case 7.1: Integration Endpoint Isolation

**Objective:** Verify integration failures don't logout users

**Steps:**
1. Login to application
2. Navigate to integrations page
3. Connect Google Drive (or any integration)
4. Revoke access from Google's side
5. In application, trigger Google Drive action
6. Verify 401 error is handled gracefully
7. Check that user remains logged in

**Expected Result:**
- Integration 401 doesn't trigger user logout
- User can reconnect integration
- Clear error message displayed

**Pass Criteria:** ✅ Integration isolation works

---

## Automated Security Testing

### 1. Unit Testing Security Controls

**File:** `src/lib/utils.test.ts`

Run existing security-related unit tests:

```bash
npm run test
```

### 2. Dependency Vulnerability Scanning

**Using npm audit:**

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for critical vulnerabilities only
npm audit --audit-level=critical
```

**Expected Output:**
```
found 0 vulnerabilities
```

**Using Snyk:**

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

### 3. Static Application Security Testing (SAST)

**Using SonarQube:**

```bash
# Run SonarQube analysis
npm run sonar
```

**Check for:**
- Hardcoded secrets
- SQL injection patterns
- XSS vulnerabilities
- Insecure randomness
- Weak cryptography

### 4. Dynamic Application Security Testing (DAST)

**Using OWASP ZAP:**

```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8080

# Run automated scan
zap-cli quick-scan https://staging.7en.ai

# Generate report
zap-cli report -o security-report.html
```

### 5. Continuous Integration Security Checks

**GitHub Actions Workflow:**

File: `.github/workflows/security-scan.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Run Snyk test
        run: npx snyk test --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run security tests
        run: npm run test:security
```

---

## Penetration Testing

### Scope

**In Scope:**
- Web application (frontend)
- REST API endpoints
- Authentication mechanisms
- Session management
- File upload functionality
- Integration endpoints

**Out of Scope:**
- Physical security
- Social engineering
- Third-party services (Google OAuth, Apple SSO)
- Denial of Service (DoS) attacks
- Production environment (without approval)

### Methodology

Follow **OWASP Testing Guide v4** methodology:

1. **Information Gathering**
   - Identify all endpoints
   - Map application architecture
   - Identify technologies used

2. **Configuration Testing**
   - Test SSL/TLS configuration
   - Check HTTP security headers
   - Verify error handling

3. **Authentication Testing**
   - Test password policy
   - Test OTP mechanism
   - Test OAuth2 flow
   - Test session management

4. **Authorization Testing**
   - Test for privilege escalation
   - Test business logic flaws
   - Test insecure direct object references

5. **Input Validation Testing**
   - Test for XSS
   - Test for SQL injection
   - Test for command injection
   - Test file upload vulnerabilities

6. **Reporting**
   - Document all findings
   - Assign CVSS scores
   - Provide remediation steps

### Penetration Testing Checklist

#### Authentication & Session Management
- [ ] Test password complexity enforcement
- [ ] Test account lockout mechanism
- [ ] Test OTP generation/validation
- [ ] Test OAuth2 authorization flow
- [ ] Test token expiration
- [ ] Test token refresh mechanism
- [ ] Test session fixation
- [ ] Test session hijacking
- [ ] Test concurrent session handling

#### Authorization & Access Control
- [ ] Test vertical privilege escalation
- [ ] Test horizontal privilege escalation
- [ ] Test forced browsing
- [ ] Test insecure direct object references
- [ ] Test missing function level access control

#### Input Validation
- [ ] Test for reflected XSS
- [ ] Test for stored XSS
- [ ] Test for DOM-based XSS
- [ ] Test for SQL injection
- [ ] Test for command injection
- [ ] Test for XML external entities (XXE)
- [ ] Test for CSV injection
- [ ] Test file upload restrictions

#### Business Logic
- [ ] Test business logic flaws
- [ ] Test race conditions
- [ ] Test transaction integrity
- [ ] Test workflow bypass

#### API Security
- [ ] Test API authentication
- [ ] Test API authorization
- [ ] Test API rate limiting
- [ ] Test API input validation
- [ ] Test API error handling

#### Client-Side Security
- [ ] Test Content Security Policy
- [ ] Test Subresource Integrity
- [ ] Test secure cookie flags
- [ ] Test sensitive data in client storage
- [ ] Test postMessage security

---

## Vulnerability Disclosure

### Reporting Security Issues

**Preferred Method:** Private vulnerability disclosure via GitHub

**Steps:**
1. Navigate to https://github.com/7en-ai/platform/security/advisories/new
2. Provide detailed report including:
   - Vulnerability description
   - Steps to reproduce
   - Proof of concept (if applicable)
   - Suggested fix (optional)
3. Wait for acknowledgment (24-48 hours)

**Alternative Method:** Email to security@7en.ai

**What to Include:**
- Detailed description of vulnerability
- Affected components/endpoints
- Steps to reproduce
- Proof of concept code/screenshots
- CVSS score (if known)
- Your contact information

**What NOT to Include:**
- Actual exploitation of production systems
- Public disclosure before fix is available
- Demands for payment (unless participating in bug bounty)

### Response Timeline

| Severity | Initial Response | Fix Deployment | Public Disclosure |
|----------|------------------|----------------|-------------------|
| Critical | 24 hours | 7 days | 30 days after fix |
| High | 48 hours | 14 days | 60 days after fix |
| Medium | 7 days | 30 days | 90 days after fix |
| Low | 14 days | 60 days | 120 days after fix |

---

## Security Testing Reports

### Report Template

```markdown
# Security Test Report

**Test Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Staging/Beta/Production]
**Scope:** [Components tested]

## Summary
- Total tests executed: X
- Passed: X
- Failed: X
- Critical findings: X
- High findings: X
- Medium findings: X
- Low findings: X

## Detailed Findings

### Finding #1: [Title]
**Severity:** [Critical/High/Medium/Low]
**CVSS Score:** X.X
**Affected Component:** [Component name]
**Description:** [Detailed description]
**Steps to Reproduce:**
1. Step 1
2. Step 2
**Impact:** [Potential impact]
**Remediation:** [Fix recommendation]
**Status:** [Open/Fixed/Accepted Risk]

[Repeat for each finding]

## Recommendations
[Overall security recommendations]

## Conclusion
[Overall security posture assessment]
```

---

## Appendix: Security Testing Tools

### Recommended Tools

| Tool | Purpose | Cost |
|------|---------|------|
| OWASP ZAP | DAST scanning | Free |
| Burp Suite | Manual testing | Free/Paid |
| Postman | API testing | Free |
| Snyk | Dependency scanning | Free/Paid |
| SonarQube | SAST scanning | Free/Paid |
| npm audit | Dependency scanning | Free |
| retire.js | JS library scanning | Free |

### Tool Setup Guides

See individual tool documentation for setup instructions:
- OWASP ZAP: https://www.zaproxy.org/getting-started/
- Burp Suite: https://portswigger.net/burp/documentation
- Snyk: https://docs.snyk.io/

---

**Document Maintained By:** Security Team  
**Last Review:** 2025-10-10  
**Next Review:** 2026-01-10
