import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';
import {
  buildPantryChips,
  type PantryFilterSelection,
} from '@/constants/chef-staples';
import type { Recipe } from '@/state/recipes';

function chipToSelection(chip: ReturnType<typeof buildPantryChips>[number]): PantryFilterSelection {
  return { id: chip.id, label: chip.label, matchTerms: chip.matchTerms };
}

/**
 * Pantry-style discovery: curated staples + keywords mined from your recipes, with counts and icons.
 */
export function HomeQuickFilters({
  recipes,
  selected,
  onSelect,
}: {
  recipes: Recipe[];
  selected: PantryFilterSelection | null;
  onSelect: (next: PantryFilterSelection | null) => void;
}) {
  const theme = useTheme();

  const chips = useMemo(() => buildPantryChips(recipes), [recipes]);

  if (chips.length === 0) return null;

  const iconColor = (active: boolean) =>
    active ? theme.colors.onPrimaryContainer : theme.colors.primary;

  return (
    <Surface
      elevation={0}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
      ]}>
      <View style={styles.headerRow}>
        <View style={[styles.headerIconTile, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="fridge-outline" size={22} color={theme.colors.onPrimaryContainer} />
        </View>
        <View style={styles.headerText}>
          <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Cook with what you have
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
            Tap an ingredient to filter your collection — counts show how many recipes use it.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}>
        <Chip
          mode={selected === null ? 'flat' : 'outlined'}
          selected={selected === null}
          onPress={() => onSelect(null)}
          style={[
            styles.chip,
            selected === null && { backgroundColor: theme.colors.secondaryContainer },
          ]}
          textStyle={selected === null ? { fontWeight: '700' } : undefined}
          compact
          icon={() => (
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={18}
              color={selected === null ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant}
              style={styles.chipLeading}
            />
          )}>
          All recipes
        </Chip>

        {chips.map((chip) => {
          const isOn = selected?.id === chip.id;
          const c = iconColor(!!isOn);
          return (
            <Chip
              key={chip.id}
              mode={isOn ? 'flat' : 'outlined'}
              selected={isOn}
              onPress={() => onSelect(isOn ? null : chipToSelection(chip))}
              style={[
                styles.chip,
                isOn && { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={isOn ? { fontWeight: '700' } : undefined}
              compact
              icon={() => (
                <MaterialCommunityIcons
                  name={chip.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={18}
                  color={isOn ? theme.colors.onPrimaryContainer : theme.colors.primary}
                  style={styles.chipLeading}
                />
              )}>
              {chip.label} · {chip.count}
            </Chip>
          );
        })}
      </ScrollView>

      {selected ? (
        <Pressable
          onPress={() => onSelect(null)}
          style={({ pressed }) => [styles.clearRow, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
          accessibilityLabel="Clear ingredient filter">
          <MaterialCommunityIcons name="close-circle-outline" size={18} color={theme.colors.primary} />
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '600' }}>
            Clear “{selected.label}” filter
          </Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: UI.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 4 },
  title: { fontWeight: '700', letterSpacing: 0.15 },
  scroll: { marginHorizontal: -2 },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 12,
  },
  chip: {
    borderRadius: 999,
  },
  chipLeading: { marginRight: -2 },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
  },
});
