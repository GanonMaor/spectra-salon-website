import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';
import type { MixSessionCardVM } from '../../viewmodels/types';

interface MixCardProps {
  mix: MixSessionCardVM;
  onPress: () => void;
}

export function MixCard({ mix, onPress }: MixCardProps) {
  const isActive = mix.state === 'weighing';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: isActive ? Colors.warning : Colors.success }]} />
          <Text style={styles.clientName}>{mix.clientName}</Text>
        </View>
        <Text style={styles.stateLabel}>{isActive ? 'Weighing' : 'Finalized'}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>{mix.itemCount} items</Text>
        <Text style={styles.stat}>{mix.totalWeightGrams}g</Text>
        <Text style={styles.cost}>₪{mix.totalCost.toFixed(2)}</Text>
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
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  stat: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cost: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
    marginLeft: 'auto',
  },
});
