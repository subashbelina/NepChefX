import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';
import type { Recipe } from '@/state/recipes';
import { BrandLogoWideFallback } from '@/ui/brand-logo';

/**
 * Compact vertical card: image strip on top, text block below.
 * Shadow lives on Surface; image uses an inner clip (not on Surface) to avoid Paper warnings.
 */
export function RecipeCardBlock({
  recipe,
  onPress,
  onToggleFavorite,
}: {
  recipe: Recipe;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const theme = useTheme();

  return (
    <Surface
      elevation={2}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}>
      <View style={styles.press}>
        <Pressable onPress={onPress} accessibilityRole="button">
          <View style={[styles.imageClip, { borderTopLeftRadius: UI.cardRadius, borderTopRightRadius: UI.cardRadius }]}>
            {recipe.imageUri ? (
              <Image
                source={{ uri: recipe.imageUri }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            ) : (
              <BrandLogoWideFallback height={UI.listImageHeight} />
            )}
          </View>
        </Pressable>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Pressable onPress={onPress} style={styles.titlePress} accessibilityRole="button">
              <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
                {recipe.title}
              </Text>
            </Pressable>
            <IconButton
              icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
              iconColor={recipe.isFavorite ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
              size={22}
              style={styles.heart}
              onPress={onToggleFavorite}
            />
          </View>

          <Pressable onPress={onPress} accessibilityRole="button">
            <Text variant="bodySmall" style={[styles.desc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
              {recipe.description}
            </Text>

            <View style={[styles.metaBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                {recipe.ingredients.slice(0, 5).join(' · ')}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
  },
  press: {
    borderRadius: UI.cardRadius,
    overflow: 'hidden',
  },
  titlePress: {
    flex: 1,
    paddingRight: 4,
  },
  imageClip: {
    height: UI.listImageHeight,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  title: {
    flex: 1,
    lineHeight: 22,
  },
  heart: { margin: -8 },
  desc: {
    lineHeight: 18,
  },
  metaBar: {
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
