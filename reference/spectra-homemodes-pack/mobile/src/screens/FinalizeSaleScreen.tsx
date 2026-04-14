import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, InfoCard, SectionHeader } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';
import { VISITS, MIXES } from '../data/fixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'FinalizeSale'>;

const route = getRouteEntry('FinalizeSale');

export function FinalizeSaleScreen({ navigation, route: navRoute }: Props) {
  const { visitId } = navRoute.params;
  const visit = visitId ? VISITS.find((v) => v.id === visitId) : null;
  const mix = visit ? MIXES.find((m) => m.visitId === visit.id) : null;
  const isRetail = !visitId;

  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      subtitle={isRetail ? 'Retail Sale (no visit)' : visit?.clientName}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <View style={styles.dr004Notice}>
        <Text style={styles.dr004Text}>
          Finalize Sale does NOT close Visit. Use Checkout Visit. (DR-004)
        </Text>
      </View>

      {isRetail && (
        <InfoCard title="Retail Sale">
          <Text style={styles.infoText}>
            Product-only sale without a visit. visit_id = null
          </Text>
        </InfoCard>
      )}

      <SectionHeader title="Services" />
      <InfoCard>
        <Text style={styles.lineItem}>
          {visit ? visit.service : 'No service (retail)'}
        </Text>
      </InfoCard>

      <SectionHeader title="Products / Mix Cost" />
      <InfoCard>
        {mix ? (
          <>
            <Text style={styles.lineItem}>Mix: {mix.totalWeightGrams}g — ₪{mix.totalCost.toFixed(2)}</Text>
            {mix.items.map((item, i) => (
              <Text key={i} style={styles.subItem}>
                {item.productName}: {item.weightGrams}g
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>No products added yet</Text>
        )}
      </InfoCard>

      <SectionHeader title="Total" />
      <InfoCard>
        <Text style={styles.totalText}>₪{mix ? mix.totalCost.toFixed(2) : '0.00'}</Text>
      </InfoCard>

      <View style={styles.actions}>
        <SecondaryButton title="Capture Payment" onPress={() => {}} />
        <PrimaryButton
          title="Complete Sale"
          onPress={() => navigation.navigate('ReceiptSuccess', { saleId: 'sale-demo-001' })}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dr004Notice: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
  },
  dr004Text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#664D03',
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lineItem: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  subItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  totalText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
