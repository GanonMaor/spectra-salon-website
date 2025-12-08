# 📦 Archive Directory

This directory contains archived components and features that have been removed from the active codebase but are preserved for potential future use.

## Archived Components

### StepsSection.tsx (archived: 2025-12-08)
**Location:** `archive/components/StepsSection.tsx.archived`

**Description:** The "Five Revolutionary Steps" section that displayed a horizontal scrollable carousel of 5 salon workflow steps.

**Reason for Archive:** Removed from homepage as requested.

**To Restore:**
1. Copy `archive/components/StepsSection.tsx.archived` to `src/screens/Frame/components/StepsSection.tsx`
2. Add import back to `src/screens/Frame/Frame.tsx`: `import { StepsSection } from "./components/StepsSection";`
3. Add component back to Frame: `<StepsSection />`
4. Re-export in `src/screens/Frame/components/index.ts`: `export { StepsSection } from "./StepsSection";`

**Dependencies:**
- `walkthroughSteps` from `src/constants/walkthroughSteps.ts`
- `VideoSection`, `SmartColorTrackingSection`, `ContactSection` components
- `BACKGROUND_IMAGES` constant

