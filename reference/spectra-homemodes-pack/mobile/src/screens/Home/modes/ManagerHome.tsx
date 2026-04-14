import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../../../theme';
import { SectionHeader } from '../../../components';
import { KpiCard } from '../../../components/kpi/KpiCard';
import { usePanel } from '../../../state/panel';
import { MOCK_KPIS, MOCK_ALERTS, MOCK_VISITS } from '../../../mocks/homeMocks';

const AUTHORITY_BADGE: Record<string, { label: string; color: string }> = {
  ai: { label: 'AI', color: '#6C63FF' },
  rule_engine: { label: 'Rule', color: Colors.warning },
  system: { label: 'System', color: Colors.danger },
};

const SEVERITY_BORDER: Record<string, string> = {
  high: Colors.danger,
  medium: Colors.warning,
  low: Colors.border,
};

export function ManagerHome() {
  const { dispatch: panelDispatch } = usePanel();

  const stuckVisits = MOCK_VISITS.filter((v) => v.stage === 'finishing');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Today's KPIs" />
      <View style={styles.kpiGrid}>
        {MOCK_KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </View>

      <SectionHeader title={`Stuck Visits (${stuckVisits.length})`} />
      {stuckVisits.length === 0 ? (
        <Text style={styles.emptyText}>No stuck visits</Text>
      ) : (
        stuckVisits.map((visit) => (
          <TouchableOpacity
            key={visit.visitId}
            style={styles.stuckRow}
            onPress={() =>
              panelDispatch({
                type: 'OPEN_PANEL',
                panelType: 'visit_detail',
                entityId: visit.visitId,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.stuckName}>{visit.clientName}</Text>
            <Text style={styles.stuckMeta}>
              {visit.service} · {visit.assignedStaffName}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <SectionHeader title={`Alerts (${MOCK_ALERTS.length})`} />
      {MOCK_ALERTS.map((alert) => {
        const badge = AUTHORITY_BADGE[alert.authority];
        return (
          <TouchableOpacity
            key={alert.id}
            style={[styles.alertCard, { borderLeftColor: SEVERITY_BORDER[alert.severity] }]}
            onPress={() => {
              /* panel-only drill-down — no home-level command dispatch */
            }}
            activeOpacity={0.8}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View style={[styles.authorityBadge, { backgroundColor: badge.color }]}>
                <Text style={styles.authorityText}>{badge.label}</Text>
              </View>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingVertical: Spacing.md,
  },
  stuckRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  stuckName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stuckMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  authorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: Spacing.sm,
  },
  authorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textInverse,
    textTransform: 'uppercase',
  },
  alertMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
