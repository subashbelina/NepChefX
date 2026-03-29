import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { type PantryFilterSelection } from '@/constants/chef-staples';
import { UI } from '@/constants/ui-layout';
import { HomeFeaturedCarousel } from '@/features/recipes/components/home-featured-carousel';
import { HomeHero } from '@/features/recipes/components/home-hero';
import { HomeQuickFilters } from '@/features/recipes/components/home-quick-filters';
import type { Recipe } from '@/types/recipe';

export type HomeDiscoverBlockProps = {
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
 * Hero + featured carousel + pantry chips. Intentionally excludes search so typing
 * does not force this subtree to reconcile (reduces VirtualizedList jank).
 */
export const HomeDiscoverBlock = memo(
  function HomeDiscoverBlock({
    recipeCount,
    favoriteCount,
    onAddPress,
    carouselRecipes,
    onPressRecipe,
    recipes,
    pantryFilter,
    onPantrySelect,
  }: HomeDiscoverBlockProps) {
    return (
      <>
        <HomeHero recipeCount={recipeCount} favoriteCount={favoriteCount} onAddPress={onAddPress} />

        {carouselRecipes.length > 0 ? (
          <View style={styles.featuredBlock}>
            <HomeFeaturedCarousel recipes={carouselRecipes} onPressRecipe={onPressRecipe} />
          </View>
        ) : null}

        <HomeQuickFilters recipes={recipes} selected={pantryFilter} onSelect={onPantrySelect} />
      </>
    );
  },
  (prev, next) =>
    prev.recipeCount === next.recipeCount &&
    prev.favoriteCount === next.favoriteCount &&
    prev.carouselRecipes === next.carouselRecipes &&
    prev.recipes === next.recipes &&
    prev.pantryFilter === next.pantryFilter &&
    prev.onAddPress === next.onAddPress &&
    prev.onPressRecipe === next.onPressRecipe &&
    prev.onPantrySelect === next.onPantrySelect,
);

const styles = StyleSheet.create({
  featuredBlock: { marginTop: 14 },
});
