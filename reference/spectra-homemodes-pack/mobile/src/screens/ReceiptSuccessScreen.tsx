import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, InfoCard } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptSuccess'>;

const route = getRouteEntry('ReceiptSuccess');

export function ReceiptSuccessScreen({ navigation, route: navRoute }: Props) {
  const { saleId } = navRoute.params;

  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <View style={styles.successContainer}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.successTitle}>Payment Complete</Text>
        <Text style={styles.saleId}>Sale: {saleId}</Text>
      </View>

      <InfoCard title="Receipt">
        <Text style={styles.receiptText}>Digital receipt ready to send</Text>
        <SecondaryButton title="Send Receipt" onPress={() => {}} />
      </InfoCard>

      <View style={styles.actions}>
        <PrimaryButton
          title="Return to Home"
          onPress={() => navigation.popToTop()}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  checkmark: {
    fontSize: 64,
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saleId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontFamily: 'monospace',
  },
  receiptText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  actions: {
    marginTop: Spacing.xl,
  },
});
