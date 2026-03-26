import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { AddRecipeCoverBlock } from '@/features/recipes/components/add-recipe-cover-block';
import { AddRecipeIngredientsAiBlock } from '@/features/recipes/components/add-recipe-ingredients-ai-block';
import { AddRecipeReviewSaveBlock } from '@/features/recipes/components/add-recipe-review-save-block';
import { UI } from '@/constants/ui-layout';
import {
  generateRecipeWithAi,
  isAiRecipeConfigured,
  type AiRecipeMode,
  parseIngredientsInput,
} from '@/services/ai-recipe';
import { useRecipes } from '@/state/recipes';
import { AppHeader } from '@/ui/app-header';

const MEALS = ['any', 'breakfast', 'lunch', 'dinner', 'snack'] as const;
const SPICES = ['any', 'mild', 'medium', 'hot'] as const;
const CUISINES = [
  'any-asian',
  'nepali',
  'indian',
  'thai',
  'japanese',
  'korean',
  'chinese',
  'vietnamese',
  'filipino',
  'malaysian',
  'indonesian',
  'sri-lankan',
] as const;

function labelMeal(m: (typeof MEALS)[number]) {
  if (m === 'any') return 'Any';
  return m.charAt(0).toUpperCase() + m.slice(1);
}

function labelSpice(s: (typeof SPICES)[number]) {
  if (s === 'any') return 'Any';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function labelCuisine(c: (typeof CUISINES)[number]) {
  if (c === 'any-asian') return 'Any Asian';
  return c
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

// Add Recipe — three block cards: cover → ingredients + AI → review & save.
export default function AddRecipeScreen() {
  const { addRecipe } = useRecipes();
  const aiReady = useMemo(() => isAiRecipeConfigured(), []);

  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [aiBusy, setAiBusy] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const [aiMode, setAiMode] = useState<AiRecipeMode>('from-ingredients');
  const [mealFocus, setMealFocus] = useState<(typeof MEALS)[number]>('any');
  const [spiceLevel, setSpiceLevel] = useState<(typeof SPICES)[number]>('any');
  const [cuisine, setCuisine] = useState<(typeof CUISINES)[number]>('any-asian');
  const [extraNotes, setExtraNotes] = useState('');
  const [aiVariation, setAiVariation] = useState(false);

  const ingredientList = useMemo(() => parseIngredientsInput(ingredientsText), [ingredientsText]);

  const canAi =
    aiReady && !aiBusy && (aiMode === 'surprise' || ingredientList.length > 0);

  const canSave = useMemo(() => {
    return title.trim().length > 0 && ingredientsText.trim().length > 0 && stepsText.trim().length > 0;
  }, [ingredientsText, stepsText, title]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0]?.uri);
  };

  const onSave = () => {
    addRecipe({ title, ingredientsText, stepsText, imageUri });
    setTitle('');
    setIngredientsText('');
    setStepsText('');
    setImageUri(undefined);
    setSnack('Recipe saved');
  };

  const runAi = async (creative: boolean) => {
    if (!aiReady || aiBusy) return;
    if (aiMode === 'from-ingredients' && ingredientList.length === 0) return;

    try {
      setAiBusy(true);
      const ai = await generateRecipeWithAi(ingredientList, {
        mode: aiMode,
        cuisine,
        mealFocus,
        spiceLevel,
        extraNotes,
        creative,
      });
      setTitle(ai.title);
      setIngredientsText(ai.ingredients.join('\n'));
      setStepsText(ai.steps.join('\n'));
      setSnack(creative ? 'New variation — check step 2 and save' : 'Recipe filled — check step 2 and save');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI request failed';
      alert(msg);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Add Recipe" />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 88, default: 0 })}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Block: optional cover */}
          <AddRecipeCoverBlock imageUri={imageUri} onPickImage={pickImage} />

          {/* Block: ingredients + AI */}
          <AddRecipeIngredientsAiBlock
            step={1}
            title="Ingredients & AI"
            subtitle={
              aiMode === 'surprise'
                ? 'List items you have (optional), adjust AI settings, then generate.'
                : 'List what you have, optionally tune AI, then generate a draft.'
            }
            ingredientsText={ingredientsText}
            onChangeIngredientsText={setIngredientsText}
            aiReady={aiReady}
            aiBusy={aiBusy}
            canAi={canAi}
            aiMode={aiMode}
            onChangeAiMode={setAiMode}
            meals={MEALS}
            mealFocus={mealFocus}
            labelMeal={labelMeal}
            onChangeMealFocus={setMealFocus}
            spices={SPICES}
            spiceLevel={spiceLevel}
            labelSpice={labelSpice}
            onChangeSpiceLevel={setSpiceLevel}
            cuisines={CUISINES}
            cuisine={cuisine}
            labelCuisine={labelCuisine}
            onChangeCuisine={setCuisine}
            extraNotes={extraNotes}
            onChangeExtraNotes={setExtraNotes}
            ingredientListCount={ingredientList.length}
            creative={aiVariation}
            onChangeCreative={setAiVariation}
            onGenerate={() => runAi(aiVariation)}
          />

          {/* Block: review */}
          <AddRecipeReviewSaveBlock
            title={title}
            onChangeTitle={setTitle}
            stepsText={stepsText}
            onChangeStepsText={setStepsText}
            canSave={canSave}
            onSave={onSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000} onIconPress={() => setSnack(null)}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  scroll: {
    padding: UI.screenPadding,
    paddingBottom: 36,
    gap: UI.cardGap + 2,
  },
});
