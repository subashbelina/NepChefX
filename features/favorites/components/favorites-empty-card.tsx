import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';

import { favoritesCardBorder, favoritesEmptyCopy, favoritesWarmBackground } from '../favorites-chrome';

type Props = {
  /** True when search is active but no rows match. */
  hasQuery: boolean;
};

export function FavoritesEmptyCard({ hasQuery }: Props) {
  const theme = useTheme();
  const border = favoritesCardBorder(theme);
  const warm = favoritesWarmBackground(theme);
  const copy = favoritesEmptyCopy(theme);

  return (
    <Surface
      elevation={0}
      style={[styles.emptyCard, { backgroundColor: warm, borderColor: border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons name="heart-outline" size={22} color={theme.colors.onPrimary} />
      </View>
      <Text variant="titleSmall" style={[styles.title, { color: copy.title }]}>
        {hasQuery ? 'No matches in Favorites' : 'No favorites yet'}
      </Text>
      <Text variant="bodySmall" style={[styles.body, { color: copy.body, opacity: copy.bodyMutedOpacity }]}>
        {hasQuery
          ? 'Try different keywords or clear the search.'
          : 'Tap the heart on any recipe card to save it here.'}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center', fontWeight: '700' },
  body: { textAlign: 'center' },
});
