export type UsageInsightSupportStatus = "supported" | "partially_supported" | "not_supported";
export type UsageInsightConfidence = "high" | "medium" | "low" | "none";
export type UsageFactLevel =
  | "usage_row"
  | "formula_component"
  | "formula"
  | "service_stage"
  | "service"
  | "client_visit"
  | "client_timeline_event";

export interface UsageInsightEvidenceReference {
  factLevel: UsageFactLevel;
  factId?: string;
  serviceEventId?: string;
  formulaId?: string;
  clientVisitId?: string;
  sourceRowIndex?: number;
}

export interface UsageInsightItem {
  id: string;
  analysisRunId: string;
  insightType: string;
  title: string;
  summary: string;
  metricValue: number | null;
  metricUnit: string | null;
  calculationDefinition: string;
  numerator: number | null;
  denominator: number | null;
  confidence: UsageInsightConfidence;
  supportStatus: UsageInsightSupportStatus;
  unresolvedDataEffect: string;
  evidenceReferences: UsageInsightEvidenceReference[];
  drillDownReferences: UsageInsightEvidenceReference[];
  payload: Record<string, unknown>;
  displayOrder: number;
}

export interface UsageUnresolvedRecord {
  id: string;
  sourceRowIndex?: number;
  rawProductName: string;
  normalizedRawName: string;
  reason: string;
  effect: string;
  candidateCount: number;
  payload: Record<string, unknown>;
}

export interface UsageDataQualityWarning {
  code: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  count?: number;
}

export interface UsageInsightPacket {
  analysisRunId: string;
  uploadIds: string[];
  organizationId: string;
  customerAccountId: string;
  salonId: string;
  pseudonymousCustomerLabel: string;
  pseudonymousSalonLabel: string;
  productTruthVersion: string;
  serviceClassifierVersion: string;
  insightEngineVersion: string;
  generatedAt: string;
  status: "completed" | "failed";
  reportStatus: "draft" | "approved" | "archived" | "superseded";
  dateRange: { start: string | null; end: string | null };
  sourceRowCount: number;
  acceptedRowCount: number;
  rejectedRowCount: number;
  resolvedProductCount: number;
  unresolvedProductCount: number;
  serviceCount: number;
  formulaCount: number;
  visitCount: number;
  clientCount: number;
  dataQuality: {
    warnings: UsageDataQualityWarning[];
    parserProfileId: string;
    rowCounts: Record<string, number>;
  };
  supportStatuses: Record<string, UsageInsightSupportStatus>;
  insightItems: UsageInsightItem[];
  unresolvedRecords: UsageUnresolvedRecord[];
}

export interface UsageReportSnapshot {
  reportId: string;
  analysisRunId: string;
  reportTitle: string;
  generatedAt: string;
  immutable: true;
  packet: UsageInsightPacket;
}

export interface UsageReportListItem {
  reportId: string;
  analysisRunId: string;
  salonId: string;
  pseudonymousSalonLabel: string;
  reportTitle: string;
  generatedAt: string;
  reportStatus: string;
  dateRange: { start: string | null; end: string | null };
  serviceCount: number;
  formulaCount: number;
  clientCount: number;
  unresolvedProductCount: number;
}

export interface UsageIntelligencePreviewResponse {
  parserProfileId: string;
  parserProfileName: string;
  detectionScore: number;
  sourceRowCount: number;
  acceptedRowCount: number;
  rejectedRowCount: number;
  dateRange: { start: string | null; end: string | null };
  serviceCount: number;
  formulaCount: number;
  visitCount: number;
  clientCount: number;
  dataQuality: UsageInsightPacket["dataQuality"];
  supportStatuses: Record<string, UsageInsightSupportStatus>;
}

export interface CreateUsageIntelligenceReportResponse {
  uploadId: string;
  analysisRunId: string;
  reportId: string;
  reportSummary: {
    reportId: string;
    reportTitle: string;
    generatedAt: string;
    dateRange: { start: string | null; end: string | null };
    serviceCount: number;
    formulaCount: number;
    clientCount: number;
    sourceRowCount: number;
    unresolvedProductCount: number;
    insightCount: number;
  };
}
