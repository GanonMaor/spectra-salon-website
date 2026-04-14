import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';
import type { SyncState } from '../viewmodels/types';

interface OfflineBannerProps {
  syncState: SyncState;
}

export function OfflineBanner({ syncState }: OfflineBannerProps) {
  if (syncState === 'synced') return null;

  const isOffline = syncState === 'offline';

  return (
    <View style={[styles.container, isOffline ? styles.offline : styles.syncing]}>
      <Text style={styles.text}>
        {isOffline ? 'Offline — changes will sync when connected' : 'Syncing...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: Colors.danger,
  },
  syncing: {
    backgroundColor: Colors.warning,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
