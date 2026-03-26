import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Searchbar, Snackbar, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeCardBlock } from '@/features/recipes/components/recipe-card-block';
import { UI } from '@/constants/ui-layout';
import { useRecipes } from '@/state/recipes';
import { BrandLogo } from '@/ui/brand-logo';

// Favorites Screen
// - Shows only favorited recipes
// - Includes search by title/ingredient
export default function FavoritesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { recipes, toggleFavorite, exportBackup, importBackup } = useRecipes();
  const [query, setQuery] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const favorites = useMemo(() => recipes.filter((r) => r.isFavorite), [recipes]);

  const filteredFavorites = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(q);
      const inIngredients = r.ingredients.some((i) => i.toLowerCase().includes(q));
      return inTitle || inIngredients;
    });
  }, [favorites, query]);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
        <Surface
          elevation={1}
          style={[
            styles.topBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}>
          <View style={styles.topBarLeft}>
            <View style={[styles.logoTile, { backgroundColor: theme.colors.primaryContainer }]}>
              <BrandLogo size={26} backing="none" borderRadius={10} />
            </View>
            <View style={styles.titleBlock}>
              <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                Favorites
              </Text>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {favorites.length} saved
              </Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <Surface
              elevation={0}
              style={[
                styles.roundAction,
                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
              ]}>
              <MaterialCommunityIcons
                name="cloud-download-outline"
                size={20}
                color={theme.colors.primary}
                onPress={async () => {
                  try {
                    const res = await importBackup();
                    if (!res) return;
                    setSnack(`Imported ${res.imported} recipes from ${res.pickedName}`);
                  } catch (e: any) {
                    setSnack(e?.message ? String(e.message) : 'Import failed');
                  }
                }}
                accessibilityLabel="Import backup"
              />
            </Surface>

            <Surface
              elevation={0}
              style={[
                styles.roundAction,
                { backgroundColor: theme.colors.primaryContainer, borderColor: 'transparent' },
              ]}>
              <MaterialCommunityIcons
                name="cloud-upload-outline"
                size={20}
                color={theme.colors.onPrimaryContainer}
                onPress={async () => {
                  try {
                    const res = await exportBackup();
                    setSnack(`Exported ${res.count} recipes`);
                  } catch (e: any) {
                    setSnack(e?.message ? String(e.message) : 'Export failed');
                  }
                }}
                accessibilityLabel="Export backup"
              />
            </Surface>
          </View>
        </Surface>

        <Surface
          elevation={1}
          style={[
            styles.searchWrap,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}>
          <View style={styles.searchClip}>
            <Searchbar
              placeholder="Search saved recipes…"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              elevation={0}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Surface>

        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <RecipeCardBlock
              recipe={item}
              onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.id } })}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <Surface
              elevation={0}
              style={[
                styles.emptyCard,
                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
              ]}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="heart-outline" size={22} color={theme.colors.onPrimaryContainer} />
              </View>
              <Text variant="titleSmall" style={{ textAlign: 'center' }}>
                {query.trim() ? 'No matches in Favorites' : 'No favorites yet'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                {query.trim()
                  ? 'Try different keywords or clear the search.'
                  : 'Tap the heart on any recipe card to save it here.'}
              </Text>
            </Surface>
          }
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
  topBar: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logoTile: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleBlock: { gap: 2, flex: 1 },
  title: { fontWeight: '800' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roundAction: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
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
  list: { paddingBottom: 32, paddingTop: 2, gap: UI.cardGap },
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
});

