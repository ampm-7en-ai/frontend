# Security Checklist for 7en.ai Platform

**Version:** 1.0  
**Last Updated:** 2025-10-10  
**Purpose:** Practical security checklist for developers, QA, and DevOps

---

## Table of Contents

1. [Pre-Development Checklist](#pre-development-checklist)
2. [During Development Checklist](#during-development-checklist)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Post-Deployment Checklist](#post-deployment-checklist)
5. [Monthly Security Maintenance](#monthly-security-maintenance)

---

## Pre-Development Checklist

### Before Starting Any New Feature

- [ ] **Review security requirements**
  - Identify if feature handles sensitive data (PII, auth tokens, API keys)
  - Determine authentication/authorization requirements
  - Identify external API integrations

- [ ] **Threat modeling**
  - What could go wrong with this feature?
  - What data needs protection?
  - Who should have access?
  - What are the abuse scenarios?

- [ ] **Dependencies review**
  - Check if new dependencies are needed
  - Review dependency security history: `npm audit`
  - Verify dependency license compatibility
  - Check dependency last update date (avoid abandoned packages)

- [ ] **Design review**
  - Review architecture with security in mind
  - Identify potential injection points
  - Plan input validation strategy
  - Design error handling (no sensitive data in errors)

---

## During Development Checklist

### Input Validation (CRITICAL)

- [ ] **All user inputs validated with Zod schemas**
  ```typescript
  // ✅ GOOD - Zod schema validation
  const formSchema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(1).max(100),
  });
  
  // ❌ BAD - No validation
  const { email, name } = formData;
  ```

- [ ] **Length constraints on all text inputs**
  - String fields: `.min()` and `.max()`
  - Arrays: `.length()` or `.min().max()`
  - Files: Check size before upload

- [ ] **Email validation on email fields**
  ```typescript
  email: z.string().email("Invalid email address")
  ```

- [ ] **Phone number validation**
  ```typescript
  phone: z.string().min(10, "Invalid phone number")
  ```

- [ ] **URL validation for URL fields**
  ```typescript
  url: z.string().url("Invalid URL")
  ```

- [ ] **Password complexity enforced**
  ```typescript
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character")
  ```

### XSS Protection

- [ ] **Never use `dangerouslySetInnerHTML` without sanitization**
  ```typescript
  // ❌ DANGEROUS - No sanitization
  <div dangerouslySetInnerHTML={{ __html: userInput }} />
  
  // ✅ SAFE - Use DOMPurify
  import DOMPurify from 'dompurify';
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
  
  // ✅ BEST - Use React components
  <div>{userInput}</div> // Automatic escaping
  ```

- [x] **XSS Protection Fully Implemented**
  - ✅ DOMPurify sanitization in vanilla JS widgets
  - ✅ React `useSanitize()` hook for all React components
  - ✅ All agent configuration fields sanitized
  - ✅ All chat message content sanitized
  - ✅ Safe markdown parsing with HTML escaping
  - ✅ See `docs/security/XSS-PREVENTION.md` for complete documentation

- [ ] **User content rendered through React components (automatic escaping)**

- [ ] **Markdown rendered with safe plugins only**
  ```typescript
  <ReactMarkdown
    rehypePlugins={[rehypeRaw]}
    remarkPlugins={[remarkGfm]}
  >
    {content}
  </ReactMarkdown>
  ```

- [ ] **No `eval()` or `Function()` constructors with user input**

- [ ] **No direct DOM manipulation with user data**
  ```typescript
  // ❌ BAD
  element.innerHTML = userInput;
  
  // ✅ GOOD
  element.textContent = userInput;
  ```

### Authentication & Authorization

- [ ] **All protected routes check authentication**
  ```typescript
  // Use AuthContext
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    navigate('/login');
  }
  ```

- [ ] **API calls use `apiRequest()` wrapper from `api-interceptor.ts`**
  ```typescript
  // ✅ GOOD - Uses auth wrapper
  import { apiGet, apiPost } from '@/utils/api-interceptor';
  const response = await apiGet('/api/agents/');
  
  // ❌ BAD - Direct fetch bypasses auth
  const response = await fetch('/api/agents/');
  ```

- [ ] **Authorization checks before sensitive operations**
  - Check user role: `user.role === 'SUPERADMIN'`
  - Check resource ownership: `resource.userId === user.id`
  - Check business ID: `resource.businessId === user.businessId`

- [ ] **No hardcoded credentials in code**
  ```typescript
  // ❌ BAD
  const API_KEY = "sk_live_abc123";
  
  // ✅ GOOD
  const API_KEY = import.meta.env.VITE_API_KEY;
  ```

### API Security

- [ ] **All API endpoints require authentication** (except public ones)

- [ ] **Use appropriate HTTP methods**
  - GET: Read operations (no side effects)
  - POST: Create operations
  - PUT/PATCH: Update operations
  - DELETE: Delete operations

- [ ] **API responses don't leak sensitive data**
  ```typescript
  // ❌ BAD - Leaks password hash
  return { user: { id, name, email, passwordHash } };
  
  // ✅ GOOD - Only return public data
  return { user: { id, name, email } };
  ```

- [ ] **Error messages don't reveal system details**
  ```typescript
  // ❌ BAD - Reveals database structure
  throw new Error("User not found in users table at row 123");
  
  // ✅ GOOD - Generic error
  throw new Error("Invalid credentials");
  ```

### File Upload Security

- [ ] **File type validation (whitelist approach)**
  ```typescript
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  ```

- [ ] **File size limits enforced**
  ```typescript
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }
  ```

- [ ] **Filenames sanitized**
  ```typescript
  // Remove special characters and limit length
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 255);
  ```

- [ ] **Files scanned for malware** (if applicable)

### Logging & Monitoring

- [ ] **No sensitive data in console.log statements**
  ```typescript
  // ❌ BAD
  console.log("User logged in:", { username, password });
  
  // ✅ GOOD
  console.log("User logged in:", { username });
  ```

- [ ] **No API keys/tokens in logs**

- [ ] **Error boundaries implemented**
  ```typescript
  <ErrorBoundary fallback={<ErrorPage />}>
    <App />
  </ErrorBoundary>
  ```

- [ ] **Authentication failures logged** (for monitoring)

### Code Quality

- [ ] **No TODO comments with security implications**
  ```typescript
  // ❌ BAD
  // TODO: Add authentication check here
  
  // ✅ GOOD
  if (!isAuthenticated) throw new UnauthorizedError();
  ```

- [ ] **TypeScript strict mode enabled**

- [ ] **ESLint security plugin rules passing**

- [ ] **No TypeScript `any` types** (use proper typing)
  ```typescript
  // ❌ BAD
  const userData: any = await fetchUser();
  
  // ✅ GOOD
  const userData: User = await fetchUser();
  ```

---

## Pre-Deployment Checklist

### Security Scanning

- [ ] **Run `npm audit` and fix all critical/high vulnerabilities**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Run Snyk scan** (if available)
  ```bash
  snyk test
  ```

- [ ] **Run security unit tests**
  ```bash
  npm run test
  ```

- [ ] **Check for exposed secrets**
  ```bash
  # Use git-secrets or similar tool
  git secrets --scan
  ```

### Authentication Testing

- [ ] **Test login with valid credentials** ✅

- [ ] **Test login with invalid credentials** ❌

- [ ] **Test password reset flow** ✅

- [ ] **Test OTP verification** ✅

- [ ] **Test OAuth2 SSO (Google/Apple)** ✅

- [ ] **Test token expiration** ✅

- [ ] **Test automatic token refresh** ✅

- [ ] **Test logout and cache clearing** ✅

### Authorization Testing

- [ ] **Verify regular users cannot access admin routes**

- [ ] **Verify users cannot access other users' data**

- [ ] **Test role-based UI rendering**

- [ ] **Test API authorization** (with different user roles)

### Input Validation Testing

- [ ] **Test all forms with invalid inputs**
  - Empty fields
  - Too long strings
  - Invalid email formats
  - Weak passwords
  - Special characters
  - SQL injection payloads
  - XSS payloads

- [ ] **Test file upload with invalid files**
  - Wrong file types
  - Oversized files
  - Malicious filenames

### XSS Testing

- [ ] **Test XSS in all input fields**
  ```
  <script>alert('XSS')</script>
  <img src=x onerror=alert('XSS')>
  <svg onload=alert('XSS')>
  ```

- [ ] **Verify user content is properly escaped**

- [ ] **Check Markdown rendering with malicious HTML**

### Environment Configuration

- [ ] **Environment variables properly set**
  ```bash
  # Check .env files
  VITE_API_BASE_URL=https://api.7en.ai/api/
  ```

- [ ] **API endpoints point to correct environment**
  - Staging → staging API
  - Beta → beta API
  - Production → production API

- [ ] **No development secrets in production config**

- [ ] **CORS configuration correct**

- [ ] **TLS/SSL certificates valid**

### Error Handling

- [ ] **No stack traces in production errors**

- [ ] **Error messages are user-friendly**

- [ ] **Error boundaries catch React errors**

- [ ] **API errors handled gracefully**
  ```typescript
  try {
    const data = await apiGet('/api/resource');
  } catch (error) {
    toast.error("Failed to load resource");
    console.error("API error:", error); // No sensitive data
  }
  ```

### Performance & Optimization

- [ ] **No performance bottlenecks that could lead to DoS**

- [ ] **Large datasets paginated** (prevent memory exhaustion)

- [ ] **File uploads streamed** (not loaded into memory)

- [ ] **Rate limiting considered** (backend)

### Documentation

- [ ] **Security features documented**

- [ ] **API authentication documented**

- [ ] **Deployment security checklist completed**

- [ ] **Incident response plan reviewed**

---

## Post-Deployment Checklist

### Immediate Post-Deployment (0-24 hours)

- [ ] **Monitor error logs for issues**
  ```bash
  # Check for unexpected errors
  tail -f /var/log/app/error.log
  ```

- [ ] **Verify authentication working in production**

- [ ] **Check API endpoints responding correctly**

- [ ] **Monitor failed login attempts**

- [ ] **Verify SSL/TLS certificate valid**

- [ ] **Test critical user flows**
  - User registration
  - Login/Logout
  - Password reset
  - Key features

### First Week Post-Deployment

- [ ] **Review security logs**

- [ ] **Check for unusual traffic patterns**

- [ ] **Monitor authentication failures**

- [ ] **Review error rates**

- [ ] **Verify rate limiting working** (if implemented)

- [ ] **Check for dependency vulnerabilities**
  ```bash
  npm audit
  ```

### Ongoing Monitoring

- [ ] **Set up security alerts**
  - Failed authentication attempts (threshold: 10/min)
  - API errors (threshold: 100/hour)
  - Unusual traffic spikes

- [ ] **Weekly vulnerability scans**
  ```bash
  npm audit
  snyk monitor
  ```

- [ ] **Monthly security review**
  - Review access logs
  - Check for outdated dependencies
  - Review security incident log

---

## Monthly Security Maintenance

### First Week of Month

- [ ] **Run comprehensive dependency audit**
  ```bash
  npm audit
  npm outdated
  ```

- [ ] **Update dependencies with security patches**
  ```bash
  npm update
  ```

- [ ] **Review GitHub security advisories**

- [ ] **Check for new CVEs affecting used libraries**

### Second Week of Month

- [ ] **Review authentication logs**
  - Failed login attempts
  - Suspicious activity patterns
  - Unusual login locations

- [ ] **Review API logs**
  - Unusual request patterns
  - Error rate trends
  - Rate limit violations

- [ ] **Check user permissions**
  - Remove inactive users
  - Audit admin accounts
  - Review role assignments

### Third Week of Month

- [ ] **Security testing**
  - Run automated security tests
  - Manual spot checks on critical features
  - Test authentication flows

- [ ] **Code review for security**
  - Review PRs from last month
  - Check for security anti-patterns
  - Verify input validation on new features

### Fourth Week of Month

- [ ] **Update security documentation**
  - Document new security measures
  - Update incident response procedures
  - Review and update this checklist

- [ ] **Security training**
  - Share security findings with team
  - Review new security best practices
  - Discuss any security incidents

- [ ] **Prepare monthly security report**
  - Vulnerabilities found and fixed
  - Security incidents (if any)
  - Recommendations for next month

---

## Emergency Security Procedures

### If Security Breach Detected

1. **Immediate Actions (0-1 hour):**
   - [ ] Isolate affected systems
   - [ ] Notify security team lead
   - [ ] Begin incident logging
   - [ ] Preserve evidence (logs, screenshots)

2. **Assessment (1-4 hours):**
   - [ ] Determine scope of breach
   - [ ] Identify affected users
   - [ ] Assess data exposure
   - [ ] Determine attack vector

3. **Containment (4-24 hours):**
   - [ ] Deploy patch/fix
   - [ ] Invalidate compromised tokens
   - [ ] Force password resets if needed
   - [ ] Monitor for continued attacks

4. **Notification (24-72 hours):**
   - [ ] Notify affected users
   - [ ] Notify stakeholders
   - [ ] Prepare public statement (if needed)
   - [ ] Report to authorities (if required by law)

5. **Recovery (1-7 days):**
   - [ ] Restore from clean backup
   - [ ] Implement additional security measures
   - [ ] Conduct post-incident review
   - [ ] Update security procedures

---

## Security Champions

### Designated Security Contacts

| Role | Name | Contact |
|------|------|---------|
| Security Lead | [Name] | security@7en.ai |
| DevOps Lead | [Name] | devops@7en.ai |
| CTO | [Name] | cto@7en.ai |

### Escalation Path

```
Developer → Team Lead → Security Lead → CTO → CEO
```

**Response Times:**
- Critical: 1 hour
- High: 4 hours
- Medium: 24 hours
- Low: 7 days

---

## Appendix: Quick Reference

### Common Vulnerabilities to Avoid

| Vulnerability | How to Prevent |
|---------------|----------------|
| XSS | Use React (auto-escaping), validate inputs, sanitize HTML |
| CSRF | JWT in localStorage, explicit Authorization headers |
| SQL Injection | Use parameterized queries, ORM |
| Auth Bypass | Check auth on all routes, validate tokens server-side |
| Privilege Escalation | Check role server-side, validate resource ownership |
| Insecure Storage | Use HTTPS, encrypt sensitive data, no secrets in localStorage |
| Broken Auth | Strong passwords, MFA, token expiration |
| Sensitive Data Exposure | HTTPS only, no PII in logs, encrypt at rest |

### Security Testing Tools

```bash
# Dependency scanning
npm audit
snyk test

# Static analysis
npm run lint
npm run type-check

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Security headers check
curl -I https://7en.ai
```

### Emergency Contacts

- **Security Team:** security@7en.ai
- **On-Call DevOps:** +1-XXX-XXX-XXXX
- **Bug Bounty:** bugbounty@7en.ai

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-10  
**Next Review:** 2025-11-10  

**Usage:** Print this checklist and keep it visible during development. Check off items as you complete them. Review monthly and update as needed.
