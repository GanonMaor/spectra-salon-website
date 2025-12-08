## Commit Revival Candidates

Purpose: Track prior working implementations that may be worth cherry-picking.

Format:
- SHA – Title
  - Files: [list]
  - Rationale: why revive
  - Risk: low/med/high

Candidates
- 78f1f37 – chore: clean structure, health function, GTM toggle, SUMIT removed
  - Files: `netlify.toml`, `index.html`, likely removed SUMIT/payment artifacts
  - Rationale: If a payment iframe is reintroduced, this commit is a reference for what was removed; consider reintroducing with stricter CSP and origin allowlisting
  - Risk: Medium – payment-related code was removed intentionally; reintroduce behind feature flag and staged rollout

Next Steps
- Run: `git log --oneline --decorate --graph -- netlify/functions` and identify email/db/auth changes
- Add exact `git cherry-pick <SHA..SHA>` sequences once candidates are vetted in a dedicated branch


