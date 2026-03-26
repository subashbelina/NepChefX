import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Chip, Surface, Text, useTheme } from 'react-native-paper';

import { SectionCard } from '@/features/recipes/components/section-card';
import { UI } from '@/constants/ui-layout';
import { useRecipes } from '@/state/recipes';
import { AppHeader } from '@/ui/app-header';
import { BrandLogoWideFallback } from '@/ui/brand-logo';

// Recipe Detail — stacked card blocks (hero + sections).
export default function RecipeDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const { getById, toggleFavorite, deleteRecipe } = useRecipes();

  const recipe = useMemo(() => {
    const id = params.id;
    if (!id) return undefined;
    return getById(String(id));
  }, [getById, params.id]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <AppHeader title="Recipe" onBack={() => router.back()} />
        <Surface
          elevation={0}
          style={[
            styles.notFoundCard,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outlineVariant,
            },
          ]}>
          <Text variant="titleSmall">Recipe not found</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            It may have been removed.
          </Text>
        </Surface>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert(
      'Delete recipe',
      `Remove “${recipe.title}”? This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipe.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={recipe.title}
        onBack={() => router.back()}
        right={
          <>
            <Appbar.Action
              icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
              iconColor={recipe.isFavorite ? theme.colors.tertiary : undefined}
              onPress={() => toggleFavorite(recipe.id)}
              accessibilityLabel="Toggle favorite"
            />
            <Appbar.Action
              icon="delete-outline"
              iconColor={theme.colors.error}
              onPress={confirmDelete}
              accessibilityLabel="Delete recipe"
            />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Surface
          elevation={2}
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}>
          <View style={[styles.heroImageClip, { borderTopLeftRadius: UI.cardRadius, borderTopRightRadius: UI.cardRadius }]}>
            {recipe.imageUri ? (
              <Image
                source={{ uri: recipe.imageUri }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            ) : (
              <BrandLogoWideFallback height={200} />
            )}
          </View>
          <View style={styles.heroBody}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              {recipe.title}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {recipe.description}
            </Text>
          </View>
        </Surface>

        <SectionCard title="Ingredients">
          <View style={styles.chips}>
            {recipe.ingredients.map((ing) => (
              <Chip key={ing} mode="flat" compact style={styles.chip} textStyle={styles.chipText}>
                {ing}
              </Chip>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Steps">
          <View style={styles.steps}>
            {recipe.steps.map((step, idx) => (
              <View key={`${idx}-${step}`} style={styles.stepRow}>
                <Surface
                  style={[
                    styles.stepBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                  elevation={0}>
                  <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
                    {idx + 1}
                  </Text>
                </Surface>
                <Text variant="bodyMedium" style={styles.stepText}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <Button
          mode="outlined"
          textColor={theme.colors.error}
          style={[styles.deleteBtn, { borderColor: theme.colors.error }]}
          icon="delete-outline"
          onPress={confirmDelete}>
          Delete recipe
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: UI.screenPadding,
    paddingBottom: 32,
    gap: UI.cardGap,
  },
  heroCard: {
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroImageClip: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroBody: { padding: 14, gap: 8 },
  heroTitle: { lineHeight: 30 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 12 },
  chipText: { fontSize: 12 },
  steps: { gap: 12 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, paddingTop: 4, lineHeight: 22 },
  deleteBtn: {
    marginTop: 4,
  },
  notFoundCard: {
    margin: UI.screenPadding,
    padding: 20,
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    alignItems: 'center',
  },
});
