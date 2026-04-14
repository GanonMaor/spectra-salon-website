import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';
import type { VisitCardVM, VisitStage } from '../../viewmodels/types';

const STAGE_CONFIG: Record<VisitStage, { label: string; color: string }> = {
  arrived: { label: 'Arrived', color: '#6C757D' },
  waiting: { label: 'Waiting', color: Colors.warning },
  in_treatment: { label: 'In Treatment', color: Colors.accent },
  finishing: { label: 'Finishing', color: '#17A2B8' },
  completed: { label: 'Completed', color: Colors.success },
};

interface VisitCardProps {
  visit: VisitCardVM;
  onPress: () => void;
  showStaff?: boolean;
}

export function VisitCard({ visit, onPress, showStaff = false }: VisitCardProps) {
  const stage = STAGE_CONFIG[visit.stage];
  const timeStr = visit.checkInAt.split('T')[1]?.slice(0, 5) ?? '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{visit.clientName}</Text>
        <View style={[styles.badge, { backgroundColor: stage.color }]}>
          <Text style={styles.badgeText}>{stage.label}</Text>
        </View>
      </View>

      <Text style={styles.service}>{visit.service}</Text>

      <View style={styles.footer}>
        <Text style={styles.meta}>{timeStr}</Text>
        {showStaff && <Text style={styles.meta}>{visit.assignedStaffName}</Text>}
        {visit.mixCost != null && (
          <Text style={styles.cost}>₪{visit.mixCost.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textInverse,
    textTransform: 'uppercase',
  },
  service: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cost: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    marginLeft: 'auto',
  },
});
