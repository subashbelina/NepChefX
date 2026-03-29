import { router } from 'expo-router';
import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, type ListRenderItemInfo, Platform, StyleSheet, View } from 'react-native';

import { RecipeCardListItem } from '@/features/recipes/components/recipe-card-block';
import { HomeListHeader } from '@/features/recipes/components/home-list-header';
import { HomeRecipesEmpty } from '@/features/recipes/components/home-recipes-empty';
import { recipeMatchesSearchQuery } from '@/features/recipes/match-recipe-search';
import {
  type PantryFilterSelection,
  recipeMatchesPantryFilter,
} from '@/constants/chef-staples';
import { UI } from '@/constants/ui-layout';
import { useRecipes } from '@/state/recipes';
import type { Recipe } from '@/types/recipe';

function recipeKeyExtractor(item: Recipe) {
  return item.id;
}

// Home — chef-focused discovery: hero, featured pick, pantry chips, searchable list.
// Search uses useDeferredValue for filtering so the VirtualizedList is not forced to
// reconcile on every keystroke; hero/carousel live in a memoized block (see HomeDiscoverBlock).
export default function HomeScreen() {
  const { recipes, toggleFavorite } = useRecipes();
  const [query, setQuery] = useState('');
  const [pantryFilter, setPantryFilter] = useState<PantryFilterSelection | null>(null);

  const deferredSearch = useDeferredValue(query.trim());

  const favoriteCount = useMemo(() => recipes.filter((r) => r.isFavorite).length, [recipes]);

  const carouselRecipes = useMemo(
    () =>
      [...recipes]
        .sort((a, b) => b.createdAt - a.createdAt)
        // Cap slides so the home header stays light (nested lists were the main jank source).
        .slice(0, 15),
    [recipes],
  );

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const searchOk = recipeMatchesSearchQuery(r, deferredSearch);
      const pantryOk = recipeMatchesPantryFilter(r, pantryFilter);
      return searchOk && pantryOk;
    });
  }, [deferredSearch, recipes, pantryFilter]);

  const hasActiveFiltersUi = query.trim().length > 0 || pantryFilter !== null;
  const hasActiveFiltersData = deferredSearch.length > 0 || pantryFilter !== null;

  const goRecipe = useCallback((id: string) => {
    router.push({ pathname: '/recipe/[id]', params: { id } });
  }, []);

  const onAddPress = useCallback(() => {
    router.push('/add');
  }, []);

  const onRecipeToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
    },
    [toggleFavorite],
  );

  const renderRecipeItem = useCallback(
    ({ item }: ListRenderItemInfo<Recipe>) => (
      <RecipeCardListItem recipe={item} onRecipePress={goRecipe} onToggleFavorite={onRecipeToggleFavorite} />
    ),
    [goRecipe, onRecipeToggleFavorite],
  );

  const clearSearchAndPantry = useCallback(() => {
    setQuery('');
    setPantryFilter(null);
  }, []);

  const listHeader = useMemo(
    () => (
      <HomeListHeader
        query={query}
        onQueryChange={setQuery}
        shownCount={filtered.length}
        totalCount={recipes.length}
        hasActiveFilters={hasActiveFiltersUi}
        recipeCount={recipes.length}
        favoriteCount={favoriteCount}
        onAddPress={onAddPress}
        carouselRecipes={carouselRecipes}
        onPressRecipe={goRecipe}
        recipes={recipes}
        pantryFilter={pantryFilter}
        onPantrySelect={setPantryFilter}
      />
    ),
    [
      query,
      filtered.length,
      recipes,
      favoriteCount,
      hasActiveFiltersUi,
      carouselRecipes,
      goRecipe,
      onAddPress,
      pantryFilter,
    ],
  );

  const renderEmpty = useCallback(
    () => (
      <HomeRecipesEmpty
        hasActiveFilters={hasActiveFiltersData}
        totalRecipes={recipes.length}
        onClearFilters={clearSearchAndPantry}
      />
    ),
    [hasActiveFiltersData, recipes.length, clearSearchAndPantry],
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FlatList
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={filtered}
          keyExtractor={recipeKeyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          renderItem={renderRecipeItem}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={100}
          windowSize={4}
          removeClippedSubviews={Platform.OS === 'ios'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: UI.screenPadding, paddingTop: 0 },
  list: { paddingBottom: 32, gap: UI.cardGap },
});
