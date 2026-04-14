import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';
import type { VisitCardVM } from '../../viewmodels/types';
import { VisitCard } from '../cards/VisitCard';

const VIRTUALIZE_THRESHOLD = 12;

interface KanbanColumnProps {
  title: string;
  visits: VisitCardVM[];
  onVisitPress: (visitId: string) => void;
  accentColor: string;
}

export function KanbanColumn({ title, visits, onVisitPress, accentColor }: KanbanColumnProps) {
  const useVirtualized = visits.length > VIRTUALIZE_THRESHOLD;

  return (
    <View style={styles.column}>
      <View style={[styles.header, { borderBottomColor: accentColor }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.countText}>{visits.length}</Text>
        </View>
      </View>

      {useVirtualized ? (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.visitId}
          renderItem={({ item }) => (
            <VisitCard
              visit={item}
              showStaff
              onPress={() => onVisitPress(item.visitId)}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          stickyHeaderIndices={[]}
        />
      ) : (
        <View style={styles.listContent}>
          {visits.map((visit) => (
            <VisitCard
              key={visit.visitId}
              visit={visit}
              showStaff
              onPress={() => onVisitPress(visit.visitId)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 260,
    marginRight: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
});
