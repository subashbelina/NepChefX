import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Searchbar, Surface, Text, useTheme } from 'react-native-paper';

import { RecipeCardBlock } from '@/features/recipes/components/recipe-card-block';
import { HomeFeaturedCarousel } from '@/features/recipes/components/home-featured-carousel';
import { HomeHero } from '@/features/recipes/components/home-hero';
import { HomeQuickFilters } from '@/features/recipes/components/home-quick-filters';
import { recipeMatchesSearchQuery } from '@/features/recipes/match-recipe-search';
import {
  type PantryFilterSelection,
  recipeMatchesPantryFilter,
} from '@/constants/chef-staples';
import { UI } from '@/constants/ui-layout';
import { useRecipes } from '@/state/recipes';

// Home — chef-focused discovery: hero, featured pick, ingredient chips, searchable list.
export default function HomeScreen() {
  const theme = useTheme();
  const { recipes, toggleFavorite } = useRecipes();
  const [query, setQuery] = useState('');
  const [pantryFilter, setPantryFilter] = useState<PantryFilterSelection | null>(null);

  const favoriteCount = useMemo(() => recipes.filter((r) => r.isFavorite).length, [recipes]);

  const carouselRecipes = useMemo(
    () => [...recipes].sort((a, b) => b.createdAt - a.createdAt),
    [recipes],
  );

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const searchOk = recipeMatchesSearchQuery(r, query);
      const pantryOk = recipeMatchesPantryFilter(r, pantryFilter);
      return searchOk && pantryOk;
    });
  }, [query, recipes, pantryFilter]);

  const goRecipe = useCallback((id: string) => {
    router.push({ pathname: '/recipe/[id]', params: { id } });
  }, []);

  const clearSearchAndPantry = useCallback(() => {
    setQuery('');
    setPantryFilter(null);
  }, []);

  const hasActiveFilters = query.trim().length > 0 || pantryFilter !== null;

  const listHeader = useMemo(
    () => (
      <>
        <HomeHero
          recipeCount={recipes.length}
          favoriteCount={favoriteCount}
          onAddPress={() => router.push('/add')}
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
              onChangeText={setQuery}
              style={styles.search}
              elevation={0}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              inputMode="search"
            />
          </View>
        </Surface>

        {carouselRecipes.length > 0 ? (
          <View style={styles.featuredBlock}>
            <HomeFeaturedCarousel recipes={carouselRecipes} onPressRecipe={goRecipe} />
          </View>
        ) : null}

        <HomeQuickFilters recipes={recipes} selected={pantryFilter} onSelect={setPantryFilter} />

        <View style={styles.sectionHead}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your recipes
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {filtered.length} shown
            {hasActiveFilters ? ` · ${recipes.length} total` : ''}
          </Text>
        </View>
      </>
    ),
    [
      carouselRecipes,
      favoriteCount,
      filtered.length,
      goRecipe,
      hasActiveFilters,
      pantryFilter,
      query,
      recipes,
      theme.colors.outlineVariant,
      theme.colors.onSurfaceVariant,
      theme.colors.surface,
    ],
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FlatList
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <RecipeCardBlock
              recipe={item}
              onPress={() => goRecipe(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <Surface
              elevation={0}
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}>
              <Text variant="titleSmall">
                {hasActiveFilters ? 'No matches for this search' : 'Nothing matches yet'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {hasActiveFilters
                  ? 'Try different words, clear the search bar, or reset the pantry chip filter.'
                  : 'Clear filters or add a recipe — your kitchen grows with every save.'}
              </Text>
              {hasActiveFilters ? (
                <Button mode="contained-tonal" onPress={clearSearchAndPantry} style={styles.emptyClearBtn}>
                  Clear search & filters
                </Button>
              ) : recipes.length === 0 ? (
                <Button mode="contained" onPress={() => router.push('/add')} style={styles.emptyClearBtn}>
                  Add your first recipe
                </Button>
              ) : null}
            </Surface>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: UI.screenPadding, paddingTop: 0 },
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
  featuredBlock: { marginTop: 14 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: { fontWeight: '700' },
  list: { paddingBottom: 32, gap: UI.cardGap },
  emptyCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    alignItems: 'center',
  },
  emptyClearBtn: { marginTop: 4 },
});
