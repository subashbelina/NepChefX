import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UI, heroCardShadow } from '@/constants/ui-layout';
import { BrandLogo } from '@/ui/brand-logo';

const HERO_WATERMARK = require('@/assets/images/NepChefXlogo.png');

function greetingLine() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning, Chef';
  if (h < 17) return 'Good afternoon, Chef';
  return 'Good evening, Chef';
}

/**
 * Rounded hero card: gradient sits inset from screen edges with shadow (not full-bleed header).
 */
export function HomeHero({
  recipeCount,
  favoriteCount,
  onAddPress,
}: {
  recipeCount: number;
  favoriteCount: number;
  onAddPress: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const title = useMemo(() => greetingLine(), []);

  return (
    <View style={[styles.root, { marginTop: Math.max(insets.top, 8) + 6 }]}>
      <View style={[styles.cardLift, heroCardShadow]}>
        <View style={[styles.cardClip, { borderRadius: UI.heroCardRadius }]}>
          <View style={styles.heroStack}>
            <LinearGradient
              colors={['#E65100', '#D84315', '#BF360C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image
              source={HERO_WATERMARK}
              style={styles.watermark}
              contentFit="contain"
              contentPosition="center"
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View style={styles.heroForeground}>
              <View style={styles.topRow}>
                <BrandLogo size={56} />
                <View style={styles.brandText}>
                  <Text variant="headlineSmall" style={styles.brandTitle}>
                    NepChefX
                  </Text>
                  <Text variant="bodyMedium" style={styles.tagline}>
                    Plan, cook, and own your recipes
                  </Text>
                </View>
              </View>

              <View style={styles.greetingRow}>
                <MaterialCommunityIcons name="chef-hat" size={28} color="rgba(255,255,255,0.95)" />
                <View style={styles.greetingText}>
                  <Text variant="titleLarge" style={styles.greeting}>
                    {title}
                  </Text>
                  <Text variant="bodyMedium" style={styles.subGreeting}>
                    Search by ingredient or jump in with a quick filter below.
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="book-open-variant" size={18} color="#fff" />
                  <Text variant="labelLarge" style={styles.statText}>
                    {recipeCount} recipes
                  </Text>
                </View>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="heart" size={18} color="#fff" />
                  <Text variant="labelLarge" style={styles.statText}>
                    {favoriteCount} saved
                  </Text>
                </View>
                <Pressable
                  onPress={onAddPress}
                  style={({ pressed }) => [
                    styles.addCta,
                    { backgroundColor: theme.colors.secondaryContainer },
                    pressed && styles.addCtaPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add a new recipe">
                  <MaterialCommunityIcons name="plus" size={22} color={theme.colors.onSecondaryContainer} />
                  <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
                    New
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Extra 4px inset beyond screen padding so the hero reads as a distinct floating card. */
  root: {
    marginHorizontal: 4,
    marginBottom: 2,
  },
  /** Shadow is applied via heroCardShadow on the wrapper (outside clip) for clean corners. */
  cardLift: {
    borderRadius: UI.heroCardRadius,
  },
  cardClip: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroStack: {
    position: 'relative',
    overflow: 'hidden',
  },
  /** Faint brand mark on top of the gradient; gradient colors stay fully opaque. */
  watermark: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
    transform: [{ scale: 1.35 }],
  },
  heroForeground: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandText: { flex: 1, gap: 2 },
  brandTitle: { color: '#fff', fontWeight: '700' },
  tagline: { color: 'rgba(255,255,255,0.88)' },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  greetingText: { flex: 1, gap: 6 },
  greeting: { color: '#fff', fontWeight: '700' },
  subGreeting: { color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  statText: { color: '#fff' },
  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addCtaPressed: { opacity: 0.92 },
});
