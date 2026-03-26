import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';

/** Titled content block for detail / forms — matches list card radius. */
export function SectionCard({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();

  return (
    <Surface
      elevation={1}
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}>
      <Text variant="labelLarge" style={[styles.title, { color: theme.colors.primary }]}>
        {title}
      </Text>
      <View style={styles.body}>{children}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  title: { letterSpacing: 0.2 },
  body: { gap: 8 },
});
