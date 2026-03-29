import { router } from 'expo-router';
import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, type ListRenderItemInfo, Platform, StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeCardListItem } from '@/features/recipes/components/recipe-card-block';
import { FavoritesEmptyCard, FavoritesHeader, FavoritesSearchSection } from '@/features/favorites/components';
import { UI } from '@/constants/ui-layout';
import { useRecipes } from '@/state/recipes';
import type { Recipe } from '@/types/recipe';

function recipeKeyExtractor(item: Recipe) {
  return item.id;
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { recipes, toggleFavorite, exportBackup, importBackup } = useRecipes();
  const [query, setQuery] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const deferredQ = useDeferredValue(query.trim().toLowerCase());

  const favorites = useMemo(() => recipes.filter((r) => r.isFavorite), [recipes]);

  const filteredFavorites = useMemo(() => {
    if (!deferredQ) return favorites;
    return favorites.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(deferredQ);
      const inIngredients = r.ingredients.some((i) => i.toLowerCase().includes(deferredQ));
      return inTitle || inIngredients;
    });
  }, [favorites, deferredQ]);

  const goRecipe = useCallback((id: string) => {
    router.push({ pathname: '/recipe/[id]', params: { id } });
  }, []);

  const onRecipeToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
    },
    [toggleFavorite],
  );

  const onImport = useCallback(async () => {
    try {
      const res = await importBackup();
      if (!res) return;
      setSnack(`Imported ${res.imported} recipes from ${res.pickedName}`);
    } catch (e: any) {
      setSnack(e?.message ? String(e.message) : 'Import failed');
    }
  }, [importBackup]);

  const onExport = useCallback(async () => {
    try {
      const res = await exportBackup();
      setSnack(`Exported ${res.count} recipes`);
    } catch (e: any) {
      setSnack(e?.message ? String(e.message) : 'Export failed');
    }
  }, [exportBackup]);

  const renderFavoriteItem = useCallback(
    ({ item }: ListRenderItemInfo<Recipe>) => (
      <RecipeCardListItem recipe={item} onRecipePress={goRecipe} onToggleFavorite={onRecipeToggleFavorite} />
    ),
    [goRecipe, onRecipeToggleFavorite],
  );

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <FavoritesHeader savedCount={favorites.length} onImport={onImport} onExport={onExport} />
        <FavoritesSearchSection query={query} onChangeQuery={setQuery} />
        <FlatList
          data={filteredFavorites}
          keyExtractor={recipeKeyExtractor}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={renderFavoriteItem}
          initialNumToRender={5}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'ios'}
          ListEmptyComponent={<FavoritesEmptyCard hasQuery={hasQuery} />}
        />
      </View>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={2600}
        action={snack ? { label: 'OK', onPress: () => setSnack(null) } : undefined}>
        {snack ?? ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: UI.screenPadding, gap: 12 },
  list: { paddingBottom: 32, paddingTop: 2, gap: UI.cardGap },
});
