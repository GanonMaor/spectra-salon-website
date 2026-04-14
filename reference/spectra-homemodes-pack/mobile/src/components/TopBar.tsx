import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, TouchTarget } from '../theme';
import type { HomeMode, SyncState } from '../viewmodels/types';

const MODE_LABELS: Record<HomeMode, { en: string; he: string }> = {
  colorbar: { en: 'ColorBar', he: 'סטייליסט' },
  reception: { en: 'Reception', he: 'קבלה' },
  manager: { en: 'Manager', he: 'מנהל' },
};

const SYNC_INDICATOR: Record<SyncState, { label: string; color: string }> = {
  synced: { label: '●', color: Colors.success },
  syncing: { label: '◐', color: Colors.warning },
  offline: { label: '○', color: Colors.danger },
};

interface TopBarProps {
  activeMode: HomeMode;
  syncState: SyncState;
  staffName: string;
  onSwitchMode: () => void;
}

export function TopBar({ activeMode, syncState, staffName, onSwitchMode }: TopBarProps) {
  const mode = MODE_LABELS[activeMode];
  const sync = SYNC_INDICATOR[syncState];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{mode.en}</Text>
        <Text style={styles.subtitle}>{mode.he}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.time}>{timeStr}</Text>
        <Text style={[styles.syncDot, { color: sync.color }]}>{sync.label}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.staffName}>{staffName}</Text>
        <TouchableOpacity style={styles.switchButton} onPress={onSwitchMode}>
          <Text style={styles.switchText}>Switch Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    minHeight: TouchTarget.large,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  time: {
    fontSize: 15,
    color: Colors.textInverse,
    fontVariant: ['tabular-nums'],
  },
  syncDot: {
    fontSize: 16,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  staffName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  switchButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
