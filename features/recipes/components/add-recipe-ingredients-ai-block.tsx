import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Switch, Text, TextInput, useTheme } from 'react-native-paper';

import { AddRecipeBlock, AddRecipeNest } from '@/features/recipes/components/add-recipe-block';
import { AddRecipeSelectChip } from '@/features/recipes/components/add-recipe-select-chip';

export function AddRecipeIngredientsAiBlock<TMeal extends string, TSpice extends string>({
  step,
  title,
  subtitle,
  ingredientsText,
  onChangeIngredientsText,
  aiReady,
  aiBusy,
  canAi,
  aiMode,
  onChangeAiMode,
  meals,
  mealFocus,
  labelMeal,
  onChangeMealFocus,
  spices,
  spiceLevel,
  labelSpice,
  onChangeSpiceLevel,
  cuisines,
  cuisine,
  labelCuisine,
  onChangeCuisine,
  extraNotes,
  onChangeExtraNotes,
  ingredientListCount,
  onGenerate,
  creative,
  onChangeCreative,
}: {
  step: number;
  title: string;
  subtitle: string;
  ingredientsText: string;
  onChangeIngredientsText: (v: string) => void;
  aiReady: boolean;
  aiBusy: boolean;
  canAi: boolean;
  aiMode: 'from-ingredients' | 'surprise';
  onChangeAiMode: (v: 'from-ingredients' | 'surprise') => void;
  meals: readonly TMeal[];
  mealFocus: TMeal;
  labelMeal: (m: TMeal) => string;
  onChangeMealFocus: (m: TMeal) => void;
  spices: readonly TSpice[];
  spiceLevel: TSpice;
  labelSpice: (s: TSpice) => string;
  onChangeSpiceLevel: (s: TSpice) => void;
  cuisines: readonly string[];
  cuisine: string;
  labelCuisine: (c: string) => string;
  onChangeCuisine: (c: string) => void;
  extraNotes: string;
  onChangeExtraNotes: (v: string) => void;
  ingredientListCount: number;
  onGenerate: () => void;
  creative: boolean;
  onChangeCreative: (v: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <AddRecipeBlock step={step} title={title} subtitle={subtitle}>
      <TextInput
        label="Ingredients"
        mode="outlined"
        value={ingredientsText}
        onChangeText={onChangeIngredientsText}
        multiline
        numberOfLines={4}
        style={styles.ingredientsInput}
        placeholder="One per line, or commas: eggs, tomato, rice"
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.secondary}
      />

      <AddRecipeNest label="AI preferences (optional)">
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
          How should the AI cook?
        </Text>
        <View style={styles.chipRow}>
          <AddRecipeSelectChip
            label="Use my list"
            selected={aiMode === 'from-ingredients'}
            onPress={() => onChangeAiMode('from-ingredients')}
            prominence="high"
          />
          <AddRecipeSelectChip
            label="Surprise me"
            selected={aiMode === 'surprise'}
            onPress={() => onChangeAiMode('surprise')}
            prominence="high"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {meals.map((m) => (
            <View key={String(m)} style={styles.chipSpacerH}>
              <AddRecipeSelectChip
                label={labelMeal(m)}
                selected={mealFocus === m}
                onPress={() => onChangeMealFocus(m)}
                tone="primary"
              />
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {spices.map((s) => (
            <View key={String(s)} style={styles.chipSpacerH}>
              <AddRecipeSelectChip
                label={labelSpice(s)}
                selected={spiceLevel === s}
                onPress={() => onChangeSpiceLevel(s)}
                tone="tertiary"
              />
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {cuisines.map((c) => (
            <View key={String(c)} style={styles.chipSpacerH}>
              <AddRecipeSelectChip
                label={labelCuisine(c)}
                selected={cuisine === c}
                onPress={() => onChangeCuisine(c)}
                tone="cuisine"
              />
            </View>
          ))}
        </ScrollView>

        <TextInput
          label="Notes for AI"
          mode="outlined"
          dense
          value={extraNotes}
          onChangeText={onChangeExtraNotes}
          placeholder="e.g. vegetarian, quick meal"
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.secondary}
        />
      </AddRecipeNest>

      {!aiReady ? (
        <HelperText type="error" visible padding="none">
          Add a Hugging Face or OpenAI key in `.env`, then restart Expo.
        </HelperText>
      ) : (
        <HelperText type="info" padding="none">
          {aiMode === 'surprise'
            ? 'Tap Generate — no ingredients required.'
            : ingredientListCount === 0
              ? 'Add ingredients above to enable Generate.'
              : `${ingredientListCount} item(s) ready for AI.`}
        </HelperText>
      )}

      <View
        style={[
          styles.creativeRow,
          {
            borderColor: theme.colors.secondary,
            backgroundColor: theme.colors.secondaryContainer,
          },
        ]}>
        <View style={styles.creativeText}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
            New variation
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, opacity: 0.85 }}>
            Makes the AI a bit more creative.
          </Text>
        </View>
        <Switch
          value={creative}
          onValueChange={onChangeCreative}
          thumbColor={creative ? theme.colors.secondary : theme.colors.outline}
          trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.secondaryContainer }}
        />
      </View>

      <Button
        mode="contained"
        onPress={onGenerate}
        disabled={!canAi}
        loading={aiBusy}
        icon="robot"
        buttonColor={theme.colors.secondary}
        textColor={theme.colors.onSecondary}
        style={styles.fullBtn}
        contentStyle={styles.btnContent}>
        Generate with AI
      </Button>
    </AddRecipeBlock>
  );
}

const styles = StyleSheet.create({
  ingredientsInput: { minHeight: 96, textAlignVertical: 'top' },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  chipSpacerH: { marginRight: 8 },
  fullBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  creativeRow: {
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creativeText: { flex: 1, paddingRight: 10 },
});

