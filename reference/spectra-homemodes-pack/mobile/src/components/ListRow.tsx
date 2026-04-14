import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, TouchTarget } from '../theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightText?: string;
}

export function ListRow({ title, subtitle, onPress, rightText }: ListRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        {onPress && <Text style={styles.chevron}>{'›'}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TouchTarget.min,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  left: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
});
