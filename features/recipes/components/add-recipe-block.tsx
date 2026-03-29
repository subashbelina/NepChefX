import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';

/**
 * Numbered block card for Add Recipe — clear hierarchy, matches app card radius.
 */
export function AddRecipeBlock({
  step,
  title,
  subtitle,
  children,
}: {
  /** Omit for simple blocks (e.g. cover photo). */
  step?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Surface
      elevation={2}
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}>
      <View style={styles.headerRow}>
        {typeof step === 'number' ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
              {step}
            </Text>
          </View>
        ) : null}
        <View style={styles.headerText}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </Surface>
  );
}

/** Nested panel inside a block (AI prefs) — soft fill, no heavy borders. */
export function AddRecipeNest({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.nest,
        {
          backgroundColor: theme.colors.secondaryContainer,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.outlineVariant,
        },
      ]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer, marginBottom: 8 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 0,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 4 },
  body: { marginTop: 14, gap: 12 },
  nest: {
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
});
