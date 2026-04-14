import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';
import type { KpiCardVM } from '../../viewmodels/types';

const TREND_ICON: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

const TREND_COLOR: Record<string, string> = {
  up: Colors.success,
  down: Colors.danger,
  flat: Colors.textSecondary,
};

interface KpiCardProps {
  kpi: KpiCardVM;
}

export function KpiCard({ kpi }: KpiCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{kpi.label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{kpi.value}</Text>
        {kpi.trend && (
          <Text style={[styles.trend, { color: TREND_COLOR[kpi.trend] }]}>
            {TREND_ICON[kpi.trend]}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 150,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trend: {
    fontSize: 18,
    fontWeight: '600',
  },
});
