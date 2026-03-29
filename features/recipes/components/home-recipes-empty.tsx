import { router } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { UI } from '@/constants/ui-layout';

type Props = {
  hasActiveFilters: boolean;
  totalRecipes: number;
  onClearFilters: () => void;
};

export const HomeRecipesEmpty = memo(function HomeRecipesEmpty({
  hasActiveFilters,
  totalRecipes,
  onClearFilters,
}: Props) {
  const theme = useTheme();

  return (
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
        <Button mode="contained-tonal" onPress={onClearFilters} style={styles.emptyClearBtn}>
          Clear search & filters
        </Button>
      ) : totalRecipes === 0 ? (
        <Button mode="contained" onPress={() => router.push('/add')} style={styles.emptyClearBtn}>
          Add your first recipe
        </Button>
      ) : null}
    </Surface>
  );
});

const styles = StyleSheet.create({
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
