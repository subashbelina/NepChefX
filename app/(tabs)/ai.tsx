import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { UI } from '@/constants/ui-layout';
import { AddRecipeSelectChip } from '@/features/recipes/components/add-recipe-select-chip';
import {
  extractIngredientsFromImageOpenAI,
  generateRecipeWithAi,
  guessImageMimeTypeFromUri,
  isAiRecipeConfigured,
  parseIngredientsInput,
  transcribeAudioOpenAI,
} from '@/services/ai-recipe';
import { useRecipes } from '@/state/recipes';
import { AppHeader } from '@/ui/app-header';

type ChatRole = 'user' | 'assistant' | 'system';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  recipe?: { title: string; ingredients: string[]; steps: string[]; description?: string };
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatRecipeText(recipe: NonNullable<ChatMessage['recipe']>) {
  const lines: string[] = [];
  lines.push(recipe.title);
  if (recipe.description) lines.push(recipe.description);
  lines.push('');
  lines.push('Ingredients');
  for (const i of recipe.ingredients) lines.push(`- ${i}`);
  lines.push('');
  lines.push('Steps');
  recipe.steps.forEach((s, idx) => lines.push(`${idx + 1}. ${s}`));
  return lines.join('\n');
}

function labelCuisine(c: string) {
  if (c === 'any-asian') return 'Any Asian';
  return c
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default function AiChatScreen() {
  const theme = useTheme();
  const { addRecipe } = useRecipes();
  const aiReady = useMemo(() => isAiRecipeConfigured(), []);

  const cuisines = useMemo(
    () =>
      [
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
      ] as const,
    [],
  );
  const [cuisine, setCuisine] = useState<(typeof cuisines)[number]>('any-asian');

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [creative, setCreative] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'system-1',
      role: 'system',
      text: aiReady
        ? 'Tell me what you have (ingredients), or ask for a surprise recipe.'
        : 'Add EXPO_PUBLIC_HF_TOKEN or EXPO_PUBLIC_OPENAI_API_KEY in `.env`, then restart Expo.',
    },
  ]);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = aiReady && !busy;

  const pushSystem = (text: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role: 'system', text }]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const send = async () => {
    if (!canSend) return;
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: makeId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    try {
      setBusy(true);
      const ingredients = parseIngredientsInput(text);
      const mode = ingredients.length > 0 ? 'from-ingredients' : 'surprise';
      const res = await generateRecipeWithAi(ingredients, { mode, creative, cuisine });
      const assistant: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        text: formatRecipeText(res),
        recipe: res,
      };
      setMessages((prev) => [...prev, assistant]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e: any) {
      const errText = e?.message ? String(e.message) : 'AI request failed';
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'assistant', text: `Sorry — ${errText}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const takePhotoAndCook = async () => {
    if (busy || !aiReady) return;
    if (Platform.OS === 'web') {
      pushSystem('Photo input is not supported on web yet.');
      return;
    }

    try {
      setBusy(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        pushSystem('Camera permission not granted.');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });
      if (res.canceled) return;
      const uri = res.assets[0]?.uri;
      if (!uri) return;

      pushSystem('Analyzing photo…');
      const file = new File(uri);
      const base64 = await file.base64();
      const mimeType = guessImageMimeTypeFromUri(uri);
      const ingredients = await extractIngredientsFromImageOpenAI({ base64, mimeType });

      if (ingredients.length === 0) {
        pushSystem('I could not detect ingredients clearly. Try a brighter photo or type them.');
        return;
      }

      const userMsg: ChatMessage = { id: makeId(), role: 'user', text: `Photo ingredients: ${ingredients.join(', ')}` };
      setMessages((prev) => [...prev, userMsg]);

      const ai = await generateRecipeWithAi(ingredients, { mode: 'from-ingredients', creative, cuisine });
      const assistant: ChatMessage = { id: makeId(), role: 'assistant', text: formatRecipeText(ai), recipe: ai };
      setMessages((prev) => [...prev, assistant]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Photo AI failed';
      pushSystem(`Sorry — ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = async () => {
    if (busy || !aiReady) return;
    if (Platform.OS === 'web') {
      pushSystem('Voice input is not supported on web yet.');
      return;
    }

    // Stop -> transcribe
    if (recorderState.isRecording) {
      try {
        setBusy(true);
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) {
          pushSystem('Recording failed.');
          return;
        }
        pushSystem('Transcribing…');
        const text = await transcribeAudioOpenAI({ uri });
        setDraft((prev) => (prev.trim() ? `${prev.trim()}\n${text}` : text));
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : 'Transcription failed';
        pushSystem(`Sorry — ${msg}`);
      } finally {
        setBusy(false);
      }
      return;
    }

    // Start recording
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        pushSystem('Microphone permission not granted.');
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      pushSystem('Recording… tap again to stop.');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Could not start recording';
      pushSystem(`Sorry — ${msg}`);
    }
  };

  const onSaveRecipe = (m: ChatMessage) => {
    if (!m.recipe) return;
    addRecipe({
      title: m.recipe.title,
      ingredientsText: m.recipe.ingredients.join('\n'),
      stepsText: m.recipe.steps.join('\n'),
    });
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'system', text: 'Saved to your recipes.' },
    ]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSystem = item.role === 'system';
    const bubbleBg = isSystem
      ? theme.colors.surfaceVariant
      : isUser
        ? theme.colors.primaryContainer
        : theme.colors.surface;
    const bubbleText = isSystem
      ? theme.colors.onSurfaceVariant
      : isUser
        ? theme.colors.onPrimaryContainer
        : theme.colors.onSurface;

    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        <Surface
          elevation={isSystem ? 0 : 1}
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderColor: theme.colors.outlineVariant,
            },
            isUser ? styles.userBubble : null,
            isSystem ? styles.systemBubble : null,
          ]}
        >
          <Text variant="bodyMedium" style={{ color: bubbleText, lineHeight: 20 }}>
            {item.text}
          </Text>

          {item.role === 'assistant' && item.recipe ? (
            <View style={styles.bubbleActions}>
              <Surface
                elevation={0}
                style={[
                  styles.savePill,
                  { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.outlineVariant },
                ]}
              >
                <Text
                  onPress={() => onSaveRecipe(item)}
                  variant="labelLarge"
                  style={{ color: theme.colors.onSecondaryContainer }}
                >
                  Save recipe
                </Text>
              </Surface>
            </View>
          ) : null}
        </Surface>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="AI"
        right={
          <IconButton
            icon="auto-fix"
            onPress={() => setCreative((v) => !v)}
            disabled={!aiReady || busy}
            accessibilityLabel="Toggle variation"
            iconColor={creative ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        }
      />

      <View style={styles.cuisineWrap}>
        <Surface
          elevation={1}
          style={[
            styles.cuisineCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}>
          <View style={styles.cuisineHead}>
            <View style={styles.cuisineHeadLeft}>
              <Text variant="titleSmall" style={{ fontWeight: '800' }}>
                Cuisine
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Pick a style — or keep it broad.
              </Text>
            </View>
            <Surface
              elevation={0}
              style={[
                styles.cuisineBadge,
                { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.outlineVariant },
              ]}>
              <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
                {labelCuisine(cuisine)}
              </Text>
            </Surface>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cuisineChipScroll}
          >
            {cuisines.map((c) => (
              <AddRecipeSelectChip
                key={c}
                label={labelCuisine(c)}
                selected={cuisine === c}
                onPress={() => setCuisine(c)}
              />
            ))}
          </ScrollView>
        </Surface>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      />

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <Surface
          elevation={2}
          style={[
            styles.composer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.leftTools}>
            <IconButton
              icon="camera"
              onPress={takePhotoAndCook}
              disabled={!aiReady || busy}
              accessibilityLabel="Take photo"
              style={styles.toolBtn}
            />
            <IconButton
              icon={recorderState.isRecording ? 'microphone' : 'microphone-outline'}
              onPress={toggleMic}
              disabled={!aiReady || busy}
              accessibilityLabel="Voice input"
              iconColor={recorderState.isRecording ? theme.colors.primary : undefined}
              style={styles.toolBtn}
            />
          </View>
          <TextInput
            mode="outlined"
            value={draft}
            onChangeText={setDraft}
            placeholder="Ingredients or ask for a surprise recipe…"
            multiline
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={styles.input}
            editable={aiReady && !busy}
          />
          <IconButton
            icon="send"
            onPress={send}
            disabled={!aiReady || busy || !draft.trim()}
            loading={busy}
            accessibilityLabel="Send"
          />
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cuisineWrap: { paddingHorizontal: UI.screenPadding, paddingTop: 4 },
  cuisineCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cuisineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  cuisineHeadLeft: { flex: 1, gap: 2 },
  cuisineBadge: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cuisineChipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 2,
    paddingRight: 6,
  },
  list: { padding: UI.screenPadding, paddingBottom: 12, gap: 10 },
  row: { flexDirection: 'row' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '92%',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: { borderTopRightRadius: 8 },
  systemBubble: { alignSelf: 'center', maxWidth: '100%', borderRadius: 14 },
  bubbleActions: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' },
  savePill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  composer: {
    margin: UI.screenPadding,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  leftTools: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  toolBtn: { margin: 0 },
  input: { flex: 1, backgroundColor: 'transparent' },
});

