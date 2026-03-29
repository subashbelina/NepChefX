import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, Surface, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';

import {
  favoritesCardBorder,
  favoritesSearchFieldColors,
  favoritesWarmBackground,
} from '../favorites-chrome';

type Props = {
  query: string;
  onChangeQuery: (q: string) => void;
};

export function FavoritesSearchSection({ query, onChangeQuery }: Props) {
  const theme = useTheme();
  const border = favoritesCardBorder(theme);
  const warm = favoritesWarmBackground(theme);
  const field = favoritesSearchFieldColors(theme);

  return (
    <Surface
      elevation={1}
      style={[styles.searchWrap, { backgroundColor: theme.colors.surface, borderColor: border }]}>
      <View style={styles.searchOverflowClip}>
        <View style={[styles.searchStrip, { backgroundColor: warm }]}>
          <Searchbar
            placeholder="Search saved recipes…"
            value={query}
            onChangeText={onChangeQuery}
            style={styles.search}
            elevation={0}
            autoCapitalize="none"
            autoCorrect={false}
            iconColor={field.iconColor}
            inputStyle={{ color: field.inputColor }}
            placeholderTextColor={field.placeholderColor}
          />
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    borderRadius: UI.searchRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  /** Clipping on `View`, not `Surface`, so elevation shadow renders correctly. */
  searchOverflowClip: {
    borderRadius: UI.searchRadius,
    overflow: 'hidden',
  },
  searchStrip: {
    borderRadius: UI.searchRadius,
  },
  search: {
    margin: 0,
    borderRadius: UI.searchRadius,
    backgroundColor: 'transparent',
  },
});
