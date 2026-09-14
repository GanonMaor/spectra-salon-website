/**
 * Local-first Spectra Start Now onboarding / order module.
 *
 * This folder is self-contained. Wire it later as a direct route, for example:
 *
 *   const StartNowPage = lazy(() =>
 *     import("./screens/StartNow").then((module) => ({ default: module.StartNowPage })),
 *   );
 *   <Route path="/start-now" element={<StartNowPage />} />
 *
 * Persistence is local. Swap the repository later:
 *   createStartNowRepository("netlify-neon")
 */
export { StartNowPage } from "./StartNowPage";
export type { StartNowPageProps } from "./StartNowPage";
export {
  createLocalStartNowRepository,
  createNetlifyNeonStartNowRepository,
  createStartNowRepository,
} from "./repository";
export type { StartNowAdapterKind } from "./repository";
export { parseStartNowSearch } from "./seed";
export { loadStartNowHandoff, saveStartNowHandoff } from "./handoff";
export { useStartNowAnalytics } from "./analytics";
export type {
  AccountDetails,
  CreateStartNowOrderInput,
  DeliveryEstimate,
  StartNowAnalyticsEvent,
  StartNowOrder,
  StartNowRepository,
  StartNowResult,
  StartNowSeed,
  StartNowSeedSource,
  ShippingAddress,
} from "./types";
