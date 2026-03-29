import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';

import { Brand } from '@/constants/brand-colors';
import { UI } from '@/constants/ui-layout';
import type { Recipe } from '@/state/recipes';

const WATERMARK = require('@/assets/images/NepChefXlogo.png');
const AUTO_INTERVAL_MS = 4200;
const SLIDE_HEIGHT = 192;

const FeaturedSlide = memo(function FeaturedSlide({
  recipe,
  width,
  onPress,
}: {
  recipe: Recipe;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ width }, pressed && styles.slidePressed]}
      accessibilityRole="button"
      accessibilityLabel={`Featured recipe: ${recipe.title}`}>
      <View style={[styles.clip, { width, height: SLIDE_HEIGHT, backgroundColor: Brand.carouselBackdrop }]}>
        {recipe.imageUri ? (
          <Image
            source={{ uri: recipe.imageUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : null}
        <LinearGradient
          colors={
            recipe.imageUri
              ? ['rgba(248,248,248,0.4)', 'rgba(55,55,55,0.6)', 'rgba(10,10,10,0.94)']
              : [...Brand.carouselNoImageGradient]
          }
          locations={recipe.imageUri ? [0, 0.48, 1] : [0, 0.42, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={WATERMARK}
          style={styles.watermark}
          contentFit="contain"
          contentPosition="center"
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View style={styles.slideContent}>
          <Chip mode="flat" compact icon="fire" style={styles.badge} textStyle={styles.badgeText}>
            Chef&apos;s pick
          </Chip>
          <View style={styles.slideTextBlock}>
            <Text variant="headlineSmall" style={styles.title} numberOfLines={2}>
              {recipe.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle} numberOfLines={2}>
              {recipe.description}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const CarouselRow = memo(
  function CarouselRow({
    recipe,
    width,
    onPressRecipe,
  }: {
    recipe: Recipe;
    width: number;
    onPressRecipe: (id: string) => void;
  }) {
    const onPress = useCallback(() => onPressRecipe(recipe.id), [onPressRecipe, recipe.id]);
    return <FeaturedSlide recipe={recipe} width={width} onPress={onPress} />;
  },
  (a, b) => a.recipe === b.recipe && a.width === b.width && a.onPressRecipe === b.onPressRecipe,
);

/**
 * Horizontal featured recipes — ScrollView (not FlatList) to avoid nesting a VirtualizedList
 * inside the home screen FlatList (major source of multi-second update warnings).
 */
export function HomeFeaturedCarousel({
  recipes,
  onPressRecipe,
}: {
  recipes: Recipe[];
  onPressRecipe: (id: string) => void;
}) {
  const theme = useTheme();
  const { width: winW } = useWindowDimensions();
  const itemWidth = winW - UI.screenPadding * 2;
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    if (recipes.length <= 1) return;
    const next = (pageRef.current + 1) % recipes.length;
    pageRef.current = next;
    setPage(next);
    scrollRef.current?.scrollTo({ x: next * itemWidth, animated: true });
  }, [recipes.length, itemWidth]);

  const armTimer = useCallback(() => {
    clearTimer();
    if (recipes.length <= 1) return;
    timerRef.current = setInterval(goNext, AUTO_INTERVAL_MS);
  }, [clearTimer, goNext, recipes.length]);

  useEffect(() => {
    armTimer();
    return clearTimer;
  }, [armTimer, clearTimer]);

  useEffect(() => {
    const max = recipes.length - 1;
    if (max < 0) return;
    if (pageRef.current > max) {
      pageRef.current = 0;
      setPage(0);
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [recipes.length]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.min(recipes.length - 1, Math.max(0, Math.round(x / itemWidth)));
      pageRef.current = idx;
      setPage(idx);
      armTimer();
    },
    [armTimer, itemWidth, recipes.length],
  );

  if (recipes.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyboardShouldPersistTaps="handled">
        {recipes.map((recipe) => (
          <CarouselRow key={recipe.id} recipe={recipe} width={itemWidth} onPressRecipe={onPressRecipe} />
        ))}
      </ScrollView>
      {recipes.length > 1 ? (
        <View style={styles.dots}>
          {recipes.map((r, i) => (
            <View
              key={r.id}
              style={[
                styles.dot,
                i === page && styles.dotActive,
                i === page && { backgroundColor: theme.colors.primary },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 2 },
  slidePressed: { opacity: 0.97 },
  clip: {
    borderRadius: UI.cardRadius,
    overflow: 'hidden',
  },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
    transform: [{ scale: 1.12 }],
  },
  slideContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  slideTextBlock: { gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  title: { color: '#fff', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6 },
  subtitle: { color: 'rgba(255,255,255,0.92)' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.carouselDotInactive,
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
  },
});
