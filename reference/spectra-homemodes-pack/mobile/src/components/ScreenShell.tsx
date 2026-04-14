import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme';
import { DebugBanner } from './DebugBanner';

interface ScreenShellProps {
  title: string;
  hebrewTitle: string;
  subtitle?: string;
  screenId: number;
  domain: string;
  primaryActions: string[];
  children: React.ReactNode;
  scrollable?: boolean;
}

export function ScreenShell({
  title,
  hebrewTitle,
  subtitle,
  screenId,
  domain,
  primaryActions,
  children,
  scrollable = true,
}: ScreenShellProps) {
  const content = (
    <>
      <DebugBanner screenId={screenId} domain={domain} primaryActions={primaryActions} />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hebrewTitle}>{hebrewTitle}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.content}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hebrewTitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
});
