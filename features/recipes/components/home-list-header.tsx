import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, Surface, Text, useTheme } from 'react-native-paper';

import { type PantryFilterSelection } from '@/constants/chef-staples';
import { UI } from '@/constants/ui-layout';
import { HomeDiscoverBlock } from '@/features/recipes/components/home-discover-block';
import type { Recipe } from '@/types/recipe';

export type HomeListHeaderProps = {
  query: string;
  onQueryChange: (q: string) => void;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  recipeCount: number;
  favoriteCount: number;
  onAddPress: () => void;
  carouselRecipes: Recipe[];
  onPressRecipe: (id: string) => void;
  recipes: Recipe[];
  pantryFilter: PantryFilterSelection | null;
  onPantrySelect: (next: PantryFilterSelection | null) => void;
};

/**
 * Home screen content above the virtualized recipe list (still one scroll via ListHeaderComponent).
 */
export function HomeListHeader({
  query,
  onQueryChange,
  shownCount,
  totalCount,
  hasActiveFilters,
  recipeCount,
  favoriteCount,
  onAddPress,
  carouselRecipes,
  onPressRecipe,
  recipes,
  pantryFilter,
  onPantrySelect,
}: HomeListHeaderProps) {
  const theme = useTheme();

  return (
    <>
      <HomeDiscoverBlock
        recipeCount={recipeCount}
        favoriteCount={favoriteCount}
        onAddPress={onAddPress}
        carouselRecipes={carouselRecipes}
        onPressRecipe={onPressRecipe}
        recipes={recipes}
        pantryFilter={pantryFilter}
        onPantrySelect={onPantrySelect}
      />

      <Surface
        elevation={1}
        style={[
          styles.searchWrap,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            marginTop: 4,
          },
        ]}>
        <View style={styles.searchClip}>
          <Searchbar
            placeholder="Search title, ingredients, steps…"
            value={query}
            onChangeText={onQueryChange}
            style={styles.search}
            elevation={0}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            inputMode="search"
          />
        </View>
      </Surface>

      <View style={styles.sectionHead}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your recipes
        </Text>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {shownCount} shown
          {hasActiveFilters ? ` · ${totalCount} total` : ''}
        </Text>
      </View>
    </>
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: { fontWeight: '700' },
});
