import type { MD3Theme } from 'react-native-paper';

import { brandOrangeBorder, brandSecondaryPillHairline } from '@/constants/brand-chrome';

/**
 * Favorites tab — warm primary strip + cyan tool accents (matches AI / Add Recipe rhythm).
 */

export function favoritesCardBorder(theme: MD3Theme): string {
  return brandOrangeBorder(theme.dark);
}

export function favoritesWarmBackground(theme: MD3Theme): string {
  return theme.colors.primaryContainer;
}

/** Cyan backup-import control: fill + light-mode hairline. */
export function favoritesImportPill(theme: MD3Theme): { backgroundColor: string; borderColor: string } {
  return {
    backgroundColor: theme.colors.secondaryContainer,
    borderColor: brandSecondaryPillHairline(theme.dark),
  };
}

export function favoritesSearchFieldColors(theme: MD3Theme): {
  iconColor: string;
  inputColor: string;
  placeholderColor: string;
} {
  return {
    iconColor: theme.colors.secondary,
    inputColor: theme.colors.onPrimaryContainer,
    placeholderColor: theme.colors.onSurfaceVariant,
  };
}

export function favoritesEmptyCopy(theme: MD3Theme): { title: string; body: string; bodyMutedOpacity: number } {
  return {
    title: theme.colors.onPrimaryContainer,
    body: theme.colors.onPrimaryContainer,
    bodyMutedOpacity: 0.88,
  };
}
