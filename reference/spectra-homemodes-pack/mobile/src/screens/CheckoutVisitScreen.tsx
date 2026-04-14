import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, InfoCard, SectionHeader } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';
import { VISITS, MIXES } from '../data/fixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutVisit'>;

const route = getRouteEntry('CheckoutVisit');

export function CheckoutVisitScreen({ navigation, route: navRoute }: Props) {
  const { visitId } = navRoute.params;
  const visit = VISITS.find((v) => v.id === visitId) ?? VISITS[0];
  const mix = MIXES.find((m) => m.visitId === visit.id);

  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      subtitle={`Closing visit for ${visit.clientName}`}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <View style={styles.dr004Notice}>
        <Text style={styles.dr004Text}>
          Only CheckoutVisit closes a Visit. Finalize Sale is separate. (INV-DR004-2)
        </Text>
      </View>

      <SectionHeader title="Visit Summary" />
      <InfoCard>
        <Text style={styles.summaryLine}>Client: {visit.clientName}</Text>
        <Text style={styles.summaryLine}>Service: {visit.service}</Text>
        <Text style={styles.summaryLine}>Started: {visit.startedAt.split('T')[1]?.slice(0, 5)}</Text>
        {mix && (
          <Text style={styles.summaryLine}>
            Mix: {mix.totalWeightGrams}g — ₪{mix.totalCost.toFixed(2)}
          </Text>
        )}
      </InfoCard>

      <View style={styles.actions}>
        <PrimaryButton
          title="Confirm Checkout"
          onPress={() => navigation.popToTop()}
        />
        <SecondaryButton
          title="Cancel"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dr004Notice: {
    backgroundColor: '#D1ECF1',
    borderLeftWidth: 4,
    borderLeftColor: '#0DCAF0',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
  },
  dr004Text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A5578',
  },
  summaryLine: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginVertical: 3,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
