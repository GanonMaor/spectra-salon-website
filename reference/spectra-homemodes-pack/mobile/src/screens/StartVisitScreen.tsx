import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell, PrimaryButton, SecondaryButton, ListRow, SectionHeader } from '../components';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, getRouteEntry } from '../navigation/routes';
import { CLIENTS } from '../data/fixtures';

type Props = NativeStackScreenProps<RootStackParamList, 'StartVisit'>;

const route = getRouteEntry('StartVisit');

export function StartVisitScreen({ navigation }: Props) {
  return (
    <ScreenShell
      title={route.screenEN}
      hebrewTitle={route.hebrew}
      screenId={route.screenId}
      domain={route.domain}
      primaryActions={route.primaryActions}
    >
      <SectionHeader title="Search Client" />
      <View style={styles.searchPlaceholder}>
        <Text style={styles.placeholderText}>Client search bar placeholder</Text>
      </View>

      <SectionHeader title="Recent Clients" />
      {CLIENTS.map((client) => (
        <ListRow
          key={client.id}
          title={client.name}
          subtitle={`Last visit: ${client.lastVisit}`}
          rightText={client.phone}
          onPress={() =>
            navigation.navigate('VisitDashboard', { visitId: `new-${client.id}` })
          }
        />
      ))}

      <View style={styles.actions}>
        <SecondaryButton
          title="Create Client"
          onPress={() => navigation.navigate('VisitDashboard', { visitId: 'new-walk-in' })}
        />
        <PrimaryButton
          title="Start Visit"
          onPress={() => navigation.navigate('VisitDashboard', { visitId: 'v-001' })}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
