/**
 * Public surface of the CRM data layer. Screens import everything
 * they need from this barrel — never reach directly into the
 * underlying files (selectors, actions, repository, simulation,
 * replay).
 */

export { CRMDataProvider } from "./CRMDataProvider";
export type { CRMRepository } from "./crmRepository";
export { seedCRMRepository, toCRMRepositoryError } from "./crmRepository";

export * from "./crmTypes";
export * from "./crmHooks";
export {
  selectAIInsights,
  selectAnalyticsRange,
  selectAppointmentsByDate,
  selectAppointmentsInRange,
  selectAppointmentsWithCustomers,
  selectCustomerLifetimeValue,
  selectCustomerSearch,
  selectCustomerVisitStats,
  selectCustomerVisits,
  selectInventoryByBrand,
  selectInventoryHealthScore,
  selectInventoryRows,
  selectLiveClients,
  selectLowStockItems,
  selectMixUsagePerVisit,
  selectRevenuePerService,
  selectReweighEfficiency,
  selectStaffPerformance,
  type AIInsight,
  type AnalyticsRangeSummary,
  type AppointmentWithCustomer,
  type InventoryJoin,
  type LiveClientVm,
  type LiveServiceVm,
  type StaffPerformanceVm,
} from "./crmSelectors";
export {
  describeAIStatus,
  listSupportedIntents,
  runScheduleCommand,
  type AICommandResult,
  type AIIntent,
  type AICommandIntent,
} from "./crmAIEngine";

// ── Reliability / production hardening ──────────────────────────

export {
  fail,
  isFail,
  isOk,
  ok,
  CRMDomainError,
  type ActionResult,
  type AffectedEntities,
  type AIDecision,
  type AIRejectionReason,
  type AITrace,
  type CRMActionTrace,
  type CRMActionType,
  type CRMError,
  type CRMErrorCode,
  type CRMStateVersion,
  type CRMStrictModeConfig,
} from "./crmContracts";

export {
  assertValidCRMState,
  validateCRMState,
  warnInvalidCRMState,
  type ValidationReport,
} from "./crmStateValidation";

export {
  getCRMStrictMode,
  resetCRMStrictMode,
  setCRMStrictMode,
} from "./crmStrictMode";

export {
  clearTraces,
  getActionTraces,
  getAITraces,
  recordActionTrace,
  recordAITrace,
  setLogLimit,
  snapshotActionTraces,
} from "./crmActionLogger";

export {
  applyActionRequest,
  type ActionRequest,
  type ApplyActionOutput,
} from "./crmActionRunner";

export {
  buildSimulationSnapshot,
  runSimulationDay,
  type SimulationOptions,
  type SimulationRun,
  type SimulationSummary,
} from "./crmSimulation";

export {
  recordAndReplay,
  recordFromTraces,
  replay,
  type RecordedAction,
  type ReplayDivergence,
  type ReplayReport,
} from "./crmReplay";
