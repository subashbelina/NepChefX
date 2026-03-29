import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import { AddRecipeBlock } from '@/features/recipes/components/add-recipe-block';

export function AddRecipeReviewSaveBlock({
  title,
  onChangeTitle,
  stepsText,
  onChangeStepsText,
  canSave,
  onSave,
}: {
  title: string;
  onChangeTitle: (v: string) => void;
  stepsText: string;
  onChangeStepsText: (v: string) => void;
  canSave: boolean;
  onSave: () => void;
}) {
  const theme = useTheme();

  return (
    <AddRecipeBlock
      step={2}
      title="Review & save"
      subtitle="Edit the draft (or write everything by hand), then save to your kitchen.">
      <TextInput
        label="Title"
        mode="outlined"
        value={title}
        onChangeText={onChangeTitle}
        autoCapitalize="sentences"
        dense
        placeholder="Recipe name"
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.secondary}
      />
      <TextInput
        label="Steps"
        mode="outlined"
        value={stepsText}
        onChangeText={onChangeStepsText}
        multiline
        numberOfLines={6}
        style={styles.stepsInput}
        placeholder="One step per line"
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.secondary}
      />
      <HelperText type="info" padding="none" style={styles.ingredientsReminder}>
        Ingredients stay in step 1 — scroll up if you need to edit the list.
      </HelperText>

      <Button
        mode="contained"
        onPress={onSave}
        disabled={!canSave}
        icon="content-save"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        style={styles.fullBtn}
        contentStyle={styles.btnContent}>
        Save to my recipes
      </Button>

      {!canSave ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Fill title, ingredients (step 1), and steps to enable save.
        </Text>
      ) : null}
    </AddRecipeBlock>
  );
}

const styles = StyleSheet.create({
  stepsInput: { minHeight: 140, textAlignVertical: 'top' },
  fullBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  ingredientsReminder: { marginTop: -6 },
});

