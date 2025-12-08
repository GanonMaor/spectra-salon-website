# 🛡️ react2shell Security Response Guide

**Vulnerability:** CVE-2025-55182, CVE-2025-66478  
**Severity:** CRITICAL (RCE)  
**Date:** December 2025

---

## ⚠️ Background

A critical vulnerability named **react2shell** was discovered affecting React Server Components (RSC) and Server Functions protocol in React 19.

**Affected:**
- React 19.0, 19.1, 19.2 (with RSC + Server Functions)
- Next.js 15/16 (multiple versions: 15.0.4, 15.1.8, 15.2.5, 15.3.5, 15.4.7, 15.5.6, 16.0.6 and earlier)
- Any RSC implementation (React Router RSC Preview, Vite RSC Plugin)

**Impact:** Remote Code Execution (RCE) via crafted Server Functions requests

---

## 🛡️ Netlify Infrastructure Protection

Netlify deployed infrastructure-level patches on **December 3, 2025 (14:00 UTC)** that:

1. ✅ Prevent exploitation at the edge/runtime level
2. ✅ Protect all sites hosted on Netlify
3. ✅ No evidence of active exploitation found

**Important:** This is an **external mitigation layer**. Code-level fixes are still required because:
- Apps may run in other environments (dev, Docker, other servers)
- Code should be patched independently of infrastructure protection

---

## 🎯 Immediate Actions Required

### Step 1: Run Official Fix Tool

For **every Next.js project**:

```bash
npx fix-react2shell-next
```

This tool:
- Scans the project
- Updates relevant dependencies
- Configures Server Functions/RSC to neutralize attack vectors

**Run once per Next.js project.**

---

### Step 2: Update React & Next.js

For projects using **Next.js 15 or 16** + React 19:

```bash
npm install next@latest react@latest react-dom@latest

# Or with yarn:
yarn upgrade next react react-dom

# Or with pnpm:
pnpm update next react react-dom
```

**Important:**
- If using lockfiles + resolutions, ensure lockfile is updated
- Redeploy after updates

---

### Step 3: Verify @netlify/open-next Auto-Update

In `package.json`, ensure `@netlify/open-next` uses caret (^) for auto-updates:

**✅ Correct:**
```json
{
  "dependencies": {
    "@netlify/open-next": "^2.0.0"
  }
}
```

**❌ Wrong (locked version):**
```json
{
  "dependencies": {
    "@netlify/open-next": "2.0.0"
  }
}
```

This allows Netlify to push security updates via npm without manual version changes.

---

### Step 4: Check Other RSC Implementations

If using:
- **Vite RSC Plugin**
- **React Router RSC Preview**

Check for:
- Specific patch releases
- Dedicated `fix-react2shell-*` tools
- Update accordingly

---

## 🧪 Post-Update Verification

After applying updates:

### 1. Functional Testing

```bash
npm run dev
npm run build
```

- Navigate through screens using Server Components / server actions
- Verify no runtime errors

### 2. Log Monitoring

- Monitor Netlify logs / error tracking
- Watch for unusual errors after update

### 3. Dev Environment Check

- Ensure dev environments (not running through Netlify) are also updated
- Netlify protection doesn't apply to local/dev environments

---

## ✅ Quick Checklist for Developers

- [ ] Run `npx fix-react2shell-next` on all Next.js projects
- [ ] Update: `npm install next@latest react@latest react-dom@latest`
- [ ] Verify `@netlify/open-next` uses `^` in package.json
- [ ] Run `npm run build` - verify success
- [ ] Test app functionality
- [ ] Monitor logs for errors

---

## 📋 Project-Specific Status

### spectra-salon-website-main

**Status:** ✅ **NOT AFFECTED**

- Uses React 18.3.1 (not React 19)
- Uses Vite (not Next.js)
- No RSC / Server Functions
- No action required

See: `docs/audit/security-react2shell-assessment.md` for full analysis.

---

## 🔗 References

- React Security Advisory: CVE-2025-55182
- Next.js Security: CVE-2025-66478
- Official Fix Tool: `npx fix-react2shell-next`
- Netlify Status: Check Netlify status page for updates

---

## 📝 Summary for Developers

**Critical RCE vulnerability** via React Server Components + Server Functions.

**For Next.js 15/16 + React 19 projects:**
1. `npx fix-react2shell-next`
2. `npm install next@latest react@latest react-dom@latest`
3. Ensure `@netlify/open-next` uses `^` in package.json
4. Build, test, monitor logs

**For React 18 / Vite projects (like this one):**
- ✅ No action needed - not affected

---

**Last Updated:** 2025-11-06  
**For Questions:** Check project security docs or contact DevOps team

