import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

import { Brand } from '@/constants/brand-colors';

export function AddRecipeSelectChip({
  label,
  selected,
  onPress,
  prominence,
  tone,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  prominence?: 'default' | 'high';
  tone?: 'primary' | 'secondary' | 'tertiary' | 'cuisine';
}) {
  const theme = useTheme();
  const high = prominence === 'high';
  const toneKey = tone ?? 'primary';
  const [hovered, setHovered] = useState(false);

  const highFontFamily = useMemo(() => {
    // Pick something that exists by default on each platform.
    // (If you later add custom fonts via expo-font, we can swap this to that font name.)
    return Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'sans-serif-medium',
      web: 'ui-rounded, system-ui, -apple-system, Segoe UI, sans-serif',
      default: undefined,
    });
  }, []);

  const canHover = Platform.OS === 'web';
  const showHover = canHover && hovered && !selected;

  // Make unselected chip outlines easier to see.
  const outlineColor = high ? theme.colors.outlineVariant : theme.colors.outline;
  const outlineWidth = high ? StyleSheet.hairlineWidth : 1;

  const { toneBg, toneFg } = useMemo(() => {
    if (toneKey === 'cuisine') {
      return theme.dark
        ? { toneBg: '#1E3D34', toneFg: '#B8E0C8' }
        : { toneBg: Brand.cuisineChipContainer, toneFg: Brand.cuisineChipOnContainer };
    }
    if (toneKey === 'secondary') {
      return { toneBg: theme.colors.secondaryContainer, toneFg: theme.colors.onSecondaryContainer };
    }
    if (toneKey === 'tertiary') {
      return { toneBg: theme.colors.tertiaryContainer, toneFg: theme.colors.onTertiaryContainer };
    }
    return { toneBg: theme.colors.primaryContainer, toneFg: theme.colors.onPrimaryContainer };
  }, [theme.dark, theme.colors, toneKey]);

  return (
    <Chip
      compact={!high}
      mode="flat"
      selected={selected}
      showSelectedCheck={false}
      onPress={onPress}
      {...(canHover
        ? ({
            // react-native-paper's Chip supports hover on web, but types may not include it.
            onHoverIn: () => setHovered(true),
            onHoverOut: () => setHovered(false),
          } as any)
        : {})}
      style={{
        backgroundColor: selected
          ? high
            ? theme.colors.primary
            : toneBg
          : showHover
            ? theme.colors.surfaceVariant
            : high
              ? theme.colors.surface
              : 'transparent',
        borderWidth: selected ? (high ? outlineWidth : StyleSheet.hairlineWidth) : outlineWidth,
        borderColor: selected ? theme.colors.outlineVariant : outlineColor,
        paddingHorizontal: high ? 6 : undefined,
        paddingVertical: high ? 2 : undefined,
        transform: showHover ? [{ translateY: -1 }] : undefined,
      }}
      textStyle={{
        color: selected ? (high ? theme.colors.onPrimary : toneFg) : theme.colors.onSurfaceVariant,
        fontSize: high ? 14 : 13,
        fontWeight: high ? '700' : undefined,
        fontFamily: high ? highFontFamily : undefined,
      }}>
      {label}
    </Chip>
  );
}

