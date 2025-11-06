## Commit Revival Candidates

Purpose: Track prior working implementations that may be worth cherry-picking.

Format:
- SHA – Title
  - Files: [list]
  - Rationale: why revive
  - Risk: low/med/high

Candidates
- TBA after mining `git log` and diffs for emails, migrations, and pipeline stability.

Next Steps
- Run: `git log --oneline --decorate --graph -- netlify/functions` and identify email/db/auth changes
- Add exact `git cherry-pick <SHA..SHA>` sequences once candidates are vetted in a dedicated branch


