import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHOW_DEBUG_BANNER } from '../theme/debug';
import { Colors, Spacing } from '../theme';

interface DebugBannerProps {
  screenId: number;
  domain: string;
  primaryActions: string[];
}

export function DebugBanner({ screenId, domain, primaryActions }: DebugBannerProps) {
  if (!SHOW_DEBUG_BANNER) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Screen #{screenId} | {domain} | {primaryActions.join(', ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.debugBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.debugBorder,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  text: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.debugText,
  },
});
