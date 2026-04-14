import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Spacing } from '../../../theme';
import { SectionHeader, PrimaryButton, SecondaryButton } from '../../../components';
import { VisitCard } from '../../../components/cards/VisitCard';
import { MixCard } from '../../../components/cards/MixCard';
import { usePanel } from '../../../state/panel';
import { useSession } from '../../../state/session';
import { MOCK_VISITS, MOCK_MIXES } from '../../../mocks/homeMocks';
import { dispatchCommand } from '../../../services/commands/dispatch';

interface ColorBarHomeProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function ColorBarHome({ onNavigate }: ColorBarHomeProps) {
  const { dispatch: panelDispatch } = usePanel();
  const { state: session } = useSession();

  const myVisits = MOCK_VISITS.filter(
    (v) => v.assignedStaffId === session.activeStaffId && v.stage !== 'completed',
  );
  const activeMixes = MOCK_MIXES.filter((m) => m.state === 'weighing');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Quick Actions" />
      <View style={styles.buttonRow}>
        <PrimaryButton
          title="Start Visit"
          onPress={() => {
            dispatchCommand('StartVisit');
            onNavigate('StartVisit');
          }}
          style={styles.flex}
        />
        <PrimaryButton
          title="Quick Mix"
          onPress={() => {
            dispatchCommand('CreateMix');
            onNavigate('MixSession', { visitId: 'v-001' });
          }}
          style={styles.flex}
        />
      </View>
      <View style={styles.buttonRow}>
        <SecondaryButton
          title="Scan Product"
          onPress={() => dispatchCommand('ScanProduct')}
          style={styles.flex}
        />
        <SecondaryButton
          title="Retail Sale"
          onPress={() => {
            dispatchCommand('StartRetailSale');
            onNavigate('FinalizeSale', { visitId: '' });
          }}
          style={styles.flex}
        />
      </View>

      <SectionHeader title={`My Clients (${myVisits.length})`} />
      {myVisits.map((visit) => (
        <VisitCard
          key={visit.visitId}
          visit={visit}
          onPress={() =>
            panelDispatch({
              type: 'OPEN_PANEL',
              panelType: 'visit_detail',
              entityId: visit.visitId,
            })
          }
        />
      ))}

      <SectionHeader title={`Active Bowls (${activeMixes.length})`} />
      {activeMixes.map((mix) => (
        <MixCard
          key={mix.mixId}
          mix={mix}
          onPress={() =>
            panelDispatch({
              type: 'OPEN_PANEL',
              panelType: 'mix_detail',
              entityId: mix.mixId,
            })
          }
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
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
