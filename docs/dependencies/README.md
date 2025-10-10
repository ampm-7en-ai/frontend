# Dependency Documentation

This directory contains comprehensive documentation about all dependencies used in the 7en.ai Platform, including security analysis, license compliance, and maintenance procedures.

---

## 📚 Available Documentation

### 1. [DEPENDENCIES.md](./DEPENDENCIES.md)
**Complete Dependency Inventory**
- Full list of all 76 dependencies
- Categorized by purpose (UI, State Management, Testing, etc.)
- Bundle size impact analysis
- Update policy and maintenance schedule
- Risk assessment and alternatives research

**When to use:** 
- Reviewing what packages are in the project
- Understanding why a package was chosen
- Planning dependency updates
- Evaluating bundle size optimizations

---

### 2. [SECURITY.md](./SECURITY.md)
**Security Vulnerability Report**
- Current vulnerability status
- Automated scanning configuration
- Remediation process and timelines
- Security best practices checklist
- Historical vulnerability trends

**When to use:**
- Responding to security alerts
- Planning security patches
- Conducting security audits
- Setting up security monitoring

---

### 3. [LICENSE-COMPLIANCE.md](./LICENSE-COMPLIANCE.md)
**License Compliance Analysis**
- License distribution breakdown (MIT, Apache-2.0, ISC)
- Commercial use compatibility matrix
- Attribution requirements
- Compliance checklist
- Legal considerations

**When to use:**
- Before adding new dependencies
- Preparing for legal review
- Generating attribution files
- Responding to compliance inquiries

---

### 4. [THIRD-PARTY-NOTICES.txt](./THIRD-PARTY-NOTICES.txt)
**Legal Attribution File**
- Complete license texts
- Copyright notices for all dependencies
- Required for distribution

**When to use:**
- Including in production builds
- Legal documentation
- Open source compliance
- Customer requests

---

## 🚀 Quick Start Guide

### For Developers

#### Adding a New Dependency
```bash
# 1. Install the package
npm install <package-name>

# 2. Check the license
npm info <package-name> license

# 3. Verify no security issues
npm audit

# 4. Update documentation (monthly batch update)
# See "Maintenance Schedule" below
```

#### Reviewing Security Updates
```bash
# Check for vulnerabilities
npm audit

# See available fixes
npm audit fix --dry-run

# Apply automatic patches
npm audit fix

# Force update (careful with breaking changes)
npm audit fix --force
```

#### Checking for Outdated Packages
```bash
# See what's outdated
npm outdated

# Update patch/minor versions
npm update

# Update specific package
npm update <package-name>
```

---

### For Security Team

#### Running Security Scans
- **Automated:** GitHub Actions runs weekly scans
- **Manual:** Run `npm audit` anytime
- **Reports:** Check `.github/workflows/monthly-audit.yml` artifacts

#### Response Procedures
See [SECURITY.md - Remediation Process](./SECURITY.md#remediation-process)

---

### For Legal/Compliance Team

#### License Review
- **Current Status:** See [LICENSE-COMPLIANCE.md](./LICENSE-COMPLIANCE.md)
- **Attribution File:** [THIRD-PARTY-NOTICES.txt](./THIRD-PARTY-NOTICES.txt)
- **Compliance:** All packages use permissive licenses (MIT/Apache-2.0/ISC)

---

## 📊 Current Status (as of 2025-10-10)

| Metric | Status | Details |
|--------|--------|---------|
| **Total Dependencies** | 76 | [View inventory](./DEPENDENCIES.md) |
| **Security Vulnerabilities** | ✅ 0 | [View report](./SECURITY.md) |
| **License Compliance** | ✅ Compliant | [View analysis](./LICENSE-COMPLIANCE.md) |
| **Outdated Packages** | 0 critical | [See list](./DEPENDENCIES.md#update-policy) |
| **Bundle Size** | ~850KB | [See breakdown](./DEPENDENCIES.md#bundle-impact) |
| **Test Coverage** | 60%+ | Via Vitest |

---

## 🔄 Maintenance Schedule

### Weekly (Automated)
- ✅ Security audit via GitHub Actions
- ✅ Dependabot PRs for security patches
- 📧 Email alerts for critical vulnerabilities

### Monthly (Manual)
- [ ] Review Dependabot PRs
- [ ] Check for outdated packages
- [ ] Update minor/patch versions
- [ ] Regenerate documentation
- [ ] Bundle size analysis

### Quarterly (Manual)
- [ ] Major version update review
- [ ] Dependency cleanup audit
- [ ] License compliance review
- [ ] Performance benchmarking
- [ ] Alternative package evaluation

### Annual (Manual)
- [ ] Comprehensive security audit
- [ ] Full dependency tree review
- [ ] Legal compliance certification
- [ ] Third-party security assessment

---

## 🛠️ Automated Tools

### 1. GitHub Dependabot
**Configuration:** `.github/dependabot.yml`
- Weekly dependency scans
- Automatic security patch PRs
- Grouped updates (Radix UI, Testing, etc.)

### 2. Monthly Audit Workflow
**Configuration:** `.github/workflows/monthly-audit.yml`
- Comprehensive security scan
- Outdated package report
- License compliance check
- Automatic GitHub issue creation

### 3. CI/CD Security Checks
**Configuration:** `.github/workflows/test.yml`
- Security audit on every push/PR
- Fail build on high/critical vulnerabilities
- Coverage reports

---

## 📋 Common Tasks

### Generating Reports

```bash
# Security audit
npm audit --json > reports/security-audit.json

# License report
npx license-checker --json --out reports/licenses.json

# Outdated packages
npm outdated --json > reports/outdated.json

# Dependency tree
npm list --all --json > reports/dependency-tree.json
```

### Updating Documentation

After adding/removing dependencies:

1. Update [DEPENDENCIES.md](./DEPENDENCIES.md)
   - Add to appropriate category
   - Document why chosen
   - Note bundle impact

2. Update [LICENSE-COMPLIANCE.md](./LICENSE-COMPLIANCE.md)
   - Verify license compatibility
   - Update license distribution stats

3. Regenerate [THIRD-PARTY-NOTICES.txt](./THIRD-PARTY-NOTICES.txt)
   ```bash
   npx license-checker --out THIRD-PARTY-NOTICES.txt
   ```

4. Update [SECURITY.md](./SECURITY.md) if security implications

---

## 🚨 Emergency Procedures

### Critical Security Vulnerability Detected

1. **Immediate Actions** (< 4 hours)
   - [ ] Assess impact and severity
   - [ ] Check if exploit is public
   - [ ] Notify security team
   - [ ] Create incident ticket

2. **Patching** (< 24 hours)
   - [ ] Test available patches in dev
   - [ ] Create hotfix branch
   - [ ] Deploy to staging
   - [ ] Run full test suite

3. **Deployment**
   - [ ] Deploy to production
   - [ ] Monitor error logs
   - [ ] Update documentation
   - [ ] Post-mortem review

See [SECURITY.md](./SECURITY.md) for detailed procedures.

---

## 📞 Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| **Security Team** | security@7en.ai | Vulnerability response |
| **Legal Team** | legal@7en.ai | License compliance |
| **Tech Lead** | [Contact] | Dependency decisions |
| **DevOps** | [Contact] | CI/CD automation |

---

## 📖 Additional Resources

### Internal Documentation
- [Main README](../../README.md)
- [Development Guide](../DEVELOPER_HANDBOOK.md)
- [Deployment Guide](../../DEPLOYMENT.md)
- [Testing Guide](../../TESTING_SETUP.md)

### External Resources
- [npm Documentation](https://docs.npmjs.com/)
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)
- [OWASP Dependencies](https://owasp.org/www-community/vulnerabilities/Dependency_Hell)
- [SPDX License List](https://spdx.org/licenses/)

---

## 🔗 Quick Links

- **View Dependencies:** [DEPENDENCIES.md](./DEPENDENCIES.md)
- **Security Status:** [SECURITY.md](./SECURITY.md)
- **License Info:** [LICENSE-COMPLIANCE.md](./LICENSE-COMPLIANCE.md)
- **Attributions:** [THIRD-PARTY-NOTICES.txt](./THIRD-PARTY-NOTICES.txt)
- **GitHub Actions:** [../../.github/workflows/](../../.github/workflows/)
- **Dependabot Config:** [../../.github/dependabot.yml](../../.github/dependabot.yml)

---

**Last Updated:** 2025-10-10  
**Document Owner:** Engineering & Security Teams  
**Review Frequency:** Monthly

For questions or updates to this documentation, please contact the development team or open an issue in the repository.
