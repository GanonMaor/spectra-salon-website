import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Spacing } from '../../../theme';
import { KanbanColumn } from '../../../components/board/KanbanColumn';
import { usePanel } from '../../../state/panel';
import { MOCK_VISITS } from '../../../mocks/homeMocks';
import type { VisitStage, VisitCardVM } from '../../../viewmodels/types';

const COLUMNS: { stage: VisitStage; title: string; color: string }[] = [
  { stage: 'arrived', title: 'Arrived', color: '#6C757D' },
  { stage: 'waiting', title: 'Waiting', color: '#FFC107' },
  { stage: 'in_treatment', title: 'In Treatment', color: '#0F3460' },
  { stage: 'finishing', title: 'Finishing', color: '#17A2B8' },
  { stage: 'completed', title: 'Completed', color: '#28A745' },
];

function sortVisitsByStage(visits: VisitCardVM[], stage: VisitStage): VisitCardVM[] {
  return [...visits].sort((a, b) => {
    switch (stage) {
      case 'arrived':
      case 'waiting':
        return a.checkInAt.localeCompare(b.checkInAt);
      case 'in_treatment':
        return a.stageUpdatedAt.localeCompare(b.stageUpdatedAt);
      case 'finishing':
        return (a.checkoutStartedAt ?? '').localeCompare(b.checkoutStartedAt ?? '');
      case 'completed':
        return (b.checkoutAt ?? '').localeCompare(a.checkoutAt ?? '');
      default:
        return 0;
    }
  });
}

export function ReceptionHome() {
  const { dispatch: panelDispatch } = usePanel();

  const columnData = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      visits: sortVisitsByStage(
        MOCK_VISITS.filter((v) => v.stage === col.stage),
        col.stage,
      ),
    }));
  }, []);

  const handleVisitPress = (visitId: string) => {
    panelDispatch({
      type: 'OPEN_PANEL',
      panelType: 'visit_detail',
      entityId: visitId,
    });
  };

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      {columnData.map((col) => (
        <KanbanColumn
          key={col.stage}
          title={col.title}
          visits={col.visits}
          accentColor={col.color}
          onVisitPress={handleVisitPress}
        />
      ))}
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
});
