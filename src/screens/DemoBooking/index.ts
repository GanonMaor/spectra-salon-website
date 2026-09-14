/**
 * Local-first Spectra demo booking module.
 *
 * This folder is self-contained. Wire it later as a direct route, for example:
 *
 *   const DemoBookingPage = lazy(() =>
 *     import("./screens/DemoBooking").then((module) => ({ default: module.DemoBookingPage })),
 *   );
 *   <Route path="/book-demo" element={<DemoBookingPage />} />
 *
 * Persistence and availability are local. Swap the repository later:
 *   createDemoBookingRepository("netlify-neon")
 */
export { DemoBookingPage } from "./DemoBookingPage";
export type { DemoBookingPageProps } from "./DemoBookingPage";
export {
  createDemoBookingRepository,
  createLocalDemoBookingRepository,
  createNetlifyNeonDemoBookingRepository,
} from "./repository";
export type { DemoBookingAdapterKind } from "./repository";
export type {
  AvailabilityQuery,
  CreateDemoBookingInput,
  DemoBooking,
  DemoBookingRepository,
  DemoBookingResult,
  QualifyingAnswers,
  SalonDetails,
  TimeSlot,
} from "./types";
