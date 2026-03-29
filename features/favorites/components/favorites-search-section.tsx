import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, Surface, useTheme } from 'react-native-paper';

import { brandCyanBorder } from '@/constants/brand-chrome';
import { UI } from '@/constants/ui-layout';

type Props = {
  query: string;
  onChangeQuery: (q: string) => void;
};

export function FavoritesSearchSection({ query, onChangeQuery }: Props) {
  const theme = useTheme();
  const border = brandCyanBorder(theme.dark);

  return (
    <Surface
      elevation={1}
      style={[styles.searchWrap, { backgroundColor: theme.colors.surface, borderColor: border }]}>
      <View style={[styles.searchClip, { backgroundColor: theme.colors.secondaryContainer }]}>
        <Searchbar
          placeholder="Search saved recipes…"
          value={query}
          onChangeText={onChangeQuery}
          style={styles.search}
          elevation={0}
          autoCapitalize="none"
          autoCorrect={false}
          iconColor={theme.colors.onSecondaryContainer}
          inputStyle={{ color: theme.colors.onSurface }}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    borderRadius: UI.searchRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchClip: {
    borderRadius: UI.searchRadius,
    overflow: 'hidden',
  },
  search: {
    margin: 0,
    borderRadius: UI.searchRadius,
    backgroundColor: 'transparent',
  },
});
