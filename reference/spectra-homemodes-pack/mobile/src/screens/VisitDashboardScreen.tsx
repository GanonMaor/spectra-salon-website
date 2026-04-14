import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, InfoCard, SectionHeader } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';
import { VISITS, MIXES } from '../data/fixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'VisitDashboard'>;

const route = getRouteEntry('VisitDashboard');

export function VisitDashboardScreen({ navigation, route: navRoute }: Props) {
  const visitId = navRoute.params.visitId;
  const visit = VISITS.find((v) => v.id === visitId) ?? VISITS[0];
  const activeMix = MIXES.find((m) => m.visitId === visit.id);

  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      subtitle={`${visit.clientName} — ${visit.service}`}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <SectionHeader title="Services" />
      <InfoCard title={visit.service}>
        <Text style={styles.detail}>Status: {visit.status}</Text>
        <Text style={styles.detail}>Started: {visit.startedAt.split('T')[1]?.slice(0, 5)}</Text>
      </InfoCard>

      <SectionHeader title="Active Mix" />
      {activeMix ? (
        <InfoCard title={`Mix — ${activeMix.totalWeightGrams}g`}>
          <Text style={styles.detail}>Items: {activeMix.items.length}</Text>
          <Text style={styles.detail}>Cost: ₪{activeMix.totalCost.toFixed(2)}</Text>
          <Text style={styles.detail}>State: {activeMix.state}</Text>
        </InfoCard>
      ) : (
        <InfoCard>
          <Text style={styles.emptyText}>No active mix</Text>
        </InfoCard>
      )}

      <SectionHeader title="Actions" />
      <View style={styles.actions}>
        <PrimaryButton
          title="Start Mix"
          onPress={() => navigation.navigate('MixSession', { visitId: visit.id })}
        />
        <SecondaryButton
          title="Finalize Sale"
          onPress={() => navigation.navigate('FinalizeSale', { visitId: visit.id })}
        />
        <SecondaryButton
          title="Checkout Visit"
          onPress={() => navigation.navigate('CheckoutVisit', { visitId: visit.id })}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  detail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    gap: Spacing.sm,
  },
});
