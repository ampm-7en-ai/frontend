# QA Environments

Environments:
- Staging → https://staging.7en.ai  (branch: staging)
- Beta    → https://beta.7en.ai     (branch: beta)
- Prod    → https://7en.ai          (branch: production/main)

Typical QA flow:
1) Merge feature branches into staging
2) Automatic deploy to Staging
3) Run smoke tests:
   - App loads without errors (no console errors)
   - Login flows (if applicable)
   - Primary pages render correctly
   - Critical actions (create/edit flows) work
4) Promote to Beta (merge into beta) for broader testing
5) Promote to Production (merge into production or main)

Smoke test checklist:
- HTML loads, assets resolve (200s)
- No blocking JS errors
- Navigation works (header, sidebar)
- Core pages load (Dashboard, Conversations, Agents)
- Forms submit successfully (mock or real backend)
- Charts render (recharts)
- UI theming is correct in light/dark

Health checks:
- scripts/health-check.sh can validate 200 status and SSL
- GitHub workflows run minimal curl checks after deploy
