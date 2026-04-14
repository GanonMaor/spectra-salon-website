export type PanelContentType = 'visit_detail' | 'mix_detail';

export interface PanelConfig {
  type: PanelContentType;
  entityId: string;
}
