import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, InfoCard, ListRow, SectionHeader } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';
import { MIXES, PRODUCTS } from '../data/fixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'MixSession'>;

const route = getRouteEntry('MixSession');

export function MixSessionScreen({ navigation, route: navRoute }: Props) {
  const { visitId } = navRoute.params;
  const mix = MIXES.find((m) => m.visitId === visitId) ?? MIXES[0];

  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      subtitle={`Mix: ${mix.id}`}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <SectionHeader title="Scale Connection" />
      <InfoCard>
        <Text style={styles.statusText}>Scale: Not connected (BLE placeholder)</Text>
      </InfoCard>

      <SectionHeader title="Mix Items" />
      {mix.items.map((item, i) => (
        <ListRow
          key={i}
          title={item.productName}
          subtitle={`Ratio: 1:${item.ratio}`}
          rightText={`${item.weightGrams}g`}
        />
      ))}

      <SectionHeader title="Available Products" />
      {PRODUCTS.slice(0, 3).map((product) => (
        <ListRow
          key={product.id}
          title={product.name}
          subtitle={product.brand}
          rightText={`₪${product.pricePerGram}/g`}
        />
      ))}

      <SectionHeader title="Summary" />
      <InfoCard>
        <Text style={styles.summaryText}>Total weight: {mix.totalWeightGrams}g</Text>
        <Text style={styles.summaryText}>Total cost: ₪{mix.totalCost.toFixed(2)}</Text>
      </InfoCard>

      <View style={styles.actions}>
        <SecondaryButton title="Continue Mix" onPress={() => {}} />
        <PrimaryButton
          title="Finish Mix"
          onPress={() => navigation.navigate('VisitDashboard', { visitId })}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
