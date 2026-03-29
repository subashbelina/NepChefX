import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { brandOrangeBorder, brandPrimaryPillHairline } from '@/constants/brand-chrome';
import { UI } from '@/constants/ui-layout';
import { AddRecipeSelectChip } from '@/features/recipes/components/add-recipe-select-chip';
import { BrandLogo } from '@/ui/brand-logo';

type Props = {
  cuisines: readonly string[];
  cuisine: string;
  onSelectCuisine: (c: string) => void;
  labelCuisine: (c: string) => string;
};

export function AiCuisineCard({ cuisines, cuisine, onSelectCuisine, labelCuisine }: Props) {
  const theme = useTheme();
  const outerBorder = brandOrangeBorder(theme.dark);

  return (
    <View style={styles.wrap}>
      <Surface
        elevation={1}
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: outerBorder }]}>
        <View style={styles.cardOverflowClip}>
          <View style={[styles.cardInner, { backgroundColor: theme.colors.primaryContainer }]}>
            <View style={styles.head}>
              <View style={styles.headLeft}>
                <View style={[styles.logoTile, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <BrandLogo size={24} backing="light" borderRadius={10} />
                </View>
                <View style={styles.headText}>
                  <Text variant="titleSmall" style={{ fontWeight: '800', color: theme.colors.onPrimaryContainer }}>
                    Cuisine
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.88 }}>
                    Pick a style — or keep it broad.
                  </Text>
                </View>
              </View>
              <Surface
                elevation={0}
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: brandPrimaryPillHairline(theme.dark),
                  },
                ]}>
                <Text variant="labelLarge" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
                  {labelCuisine(cuisine)}
                </Text>
              </Surface>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}>
              {cuisines.map((c) => (
                <AddRecipeSelectChip
                  key={c}
                  label={labelCuisine(c)}
                  selected={cuisine === c}
                  onPress={() => onSelectCuisine(c)}
                  tone="cuisine"
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: UI.screenPadding, paddingTop: 4 },
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardOverflowClip: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardInner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  headLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoTile: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headText: { flex: 1, gap: 2 },
  badge: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 2,
    paddingRight: 6,
  },
});
