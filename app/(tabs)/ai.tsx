import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { UI } from '@/constants/ui-layout';
import { AiChatMessageRow } from '@/features/ai/components/ai-chat-message-row';
import { AiComposerBar } from '@/features/ai/components/ai-composer-bar';
import { AiCuisineCard } from '@/features/ai/components/ai-cuisine-card';
import {
  formatRecipeText,
  labelCuisine,
  makeChatId,
  type ChatMessage,
} from '@/features/ai/chat-model';
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
    setMessages((prev) => [...prev, { id: makeChatId(), role: 'system', text }]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const send = async () => {
    if (!canSend) return;
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: makeChatId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    try {
      setBusy(true);
      const ingredients = parseIngredientsInput(text);
      const mode = ingredients.length > 0 ? 'from-ingredients' : 'surprise';
      const res = await generateRecipeWithAi(ingredients, { mode, creative, cuisine });
      const assistant: ChatMessage = {
        id: makeChatId(),
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
        { id: makeChatId(), role: 'assistant', text: `Sorry — ${errText}` },
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

      const userMsg: ChatMessage = { id: makeChatId(), role: 'user', text: `Photo ingredients: ${ingredients.join(', ')}` };
      setMessages((prev) => [...prev, userMsg]);

      const ai = await generateRecipeWithAi(ingredients, { mode: 'from-ingredients', creative, cuisine });
      const assistant: ChatMessage = { id: makeChatId(), role: 'assistant', text: formatRecipeText(ai), recipe: ai };
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

  const onSaveRecipe = useCallback(
    (m: ChatMessage) => {
      if (!m.recipe) return;
      addRecipe({
        title: m.recipe.title,
        ingredientsText: m.recipe.ingredients.join('\n'),
        stepsText: m.recipe.steps.join('\n'),
      });
      setMessages((prev) => [...prev, { id: makeChatId(), role: 'system', text: 'Saved to your recipes.' }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    },
    [addRecipe],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <AiChatMessageRow item={item} onSaveRecipe={onSaveRecipe} />
    ),
    [onSaveRecipe],
  );

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
            iconColor={creative ? theme.colors.secondary : theme.colors.onSurfaceVariant}
          />
        }
      />

      <AiCuisineCard
        cuisines={cuisines}
        cuisine={cuisine}
        onSelectCuisine={(c) => setCuisine(c as (typeof cuisines)[number])}
        labelCuisine={labelCuisine}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      />

      <AiComposerBar
        draft={draft}
        onChangeDraft={setDraft}
        busy={busy}
        aiReady={aiReady}
        isRecording={recorderState.isRecording}
        onSend={send}
        onTakePhoto={takePhotoAndCook}
        onToggleMic={toggleMic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: UI.screenPadding, paddingBottom: 12, gap: 10 },
});

