# 📧 Slack/Email Template: react2shell Security Update

---

**Subject:** 🔒 URGENT: react2shell Security Patch Required (Next.js Projects Only)

---

## ⚠️ Critical Security Update Required

A critical RCE vulnerability (**react2shell**) was discovered affecting React Server Components in React 19 + Next.js 15/16.

**Impact:** Remote Code Execution via Server Functions

**Netlify Status:** ✅ Infrastructure-level protection deployed (Dec 3), but code-level fixes still required.

---

## 🎯 Action Required (Next.js Projects Only)

### 1. Run Official Fix Tool

```bash
npx fix-react2shell-next
```

### 2. Update Dependencies

```bash
npm install next@latest react@latest react-dom@latest
```

### 3. Verify Auto-Update Enabled

In `package.json`, ensure:

```json
"@netlify/open-next": "^2.0.0"  // ✅ With caret
```

Not: `"@netlify/open-next": "2.0.0"` ❌

### 4. Test & Deploy

```bash
npm run build
npm run dev  # Verify functionality
```

---

## ✅ Project Status Check

**spectra-salon-website-main:** ✅ **NOT AFFECTED**
- Uses React 18 + Vite (not Next.js)
- No action needed

**Other Next.js projects:** ⚠️ **ACTION REQUIRED**
- Follow steps above

---

## 📚 Full Details

See: `docs/audit/react2shell-security-guide.md`

**Questions?** Check the guide or ping DevOps.

---

**CVEs:** CVE-2025-55182, CVE-2025-66478  
**Fix Tool:** `npx fix-react2shell-next`

