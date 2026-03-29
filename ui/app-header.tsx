import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Appbar, Surface, Text, useTheme } from 'react-native-paper';

import { BrandLogo } from '@/ui/brand-logo';

export function AppHeader({
  title,
  showLogo,
  onBack,
  backLabel = 'Back',
  right,
}: {
  title: string;
  showLogo?: boolean;
  onBack?: () => void;
  /** Shown next to the chevron when `onBack` is set (replaces the system "(tabs)" style parent label). */
  backLabel?: string;
  right?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Appbar.Header mode="small">
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={({ pressed }) => [styles.backPressable, pressed && styles.backPressed]}>
          <Surface
            style={[
              styles.backPill,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
            elevation={1}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.primary} />
            <Text variant="labelLarge" style={[styles.backLabel, { color: theme.colors.onSurface }]}>
              {backLabel}
            </Text>
          </Surface>
        </Pressable>
      ) : null}
      {showLogo ? (
        <View style={styles.logoWrap}>
          <BrandLogo size={30} />
        </View>
      ) : null}
      <Appbar.Content title={title} titleStyle={styles.title} />
      {right}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  backPressable: {
    marginLeft: 4,
    marginRight: 4,
    alignSelf: 'center',
  },
  backPressed: { opacity: 0.88 },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  backLabel: { marginLeft: -2 },
  logoWrap: { paddingLeft: 8, paddingRight: 4 },
  title: { fontWeight: '600' },
});
