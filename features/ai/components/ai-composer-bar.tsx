import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { IconButton, Surface, TextInput, useTheme } from 'react-native-paper';

import { brandCyanBorder } from '@/constants/brand-chrome';
import { UI } from '@/constants/ui-layout';

type Props = {
  draft: string;
  onChangeDraft: (t: string) => void;
  busy: boolean;
  aiReady: boolean;
  isRecording: boolean;
  onSend: () => void;
  onTakePhoto: () => void;
  onToggleMic: () => void;
};

export function AiComposerBar({
  draft,
  onChangeDraft,
  busy,
  aiReady,
  isRecording,
  onSend,
  onTakePhoto,
  onToggleMic,
}: Props) {
  const theme = useTheme();
  const border = brandCyanBorder(theme.dark);

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <Surface
        elevation={2}
        style={[
          styles.composer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: border,
          },
        ]}>
        <View style={[styles.inputShell, { backgroundColor: theme.colors.secondaryContainer }]}>
          <View style={styles.leftTools}>
            <IconButton
              icon="camera"
              onPress={onTakePhoto}
              disabled={!aiReady || busy}
              accessibilityLabel="Take photo"
              iconColor={theme.colors.secondary}
              style={styles.toolBtn}
            />
            <IconButton
              icon={isRecording ? 'microphone' : 'microphone-outline'}
              onPress={onToggleMic}
              disabled={!aiReady || busy}
              accessibilityLabel="Voice input"
              iconColor={isRecording ? theme.colors.secondary : theme.colors.onSecondaryContainer}
              style={styles.toolBtn}
            />
          </View>
          <TextInput
            mode="outlined"
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="Ingredients or ask for a surprise recipe…"
            multiline
            outlineColor={theme.dark ? 'rgba(93, 213, 232, 0.45)' : 'rgba(0, 172, 193, 0.35)'}
            activeOutlineColor={theme.colors.secondary}
            style={styles.input}
            textColor={theme.colors.onSurface}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            editable={aiReady && !busy}
          />
          <IconButton
            icon="send"
            onPress={onSend}
            disabled={!aiReady || busy || !draft.trim()}
            loading={busy}
            accessibilityLabel="Send"
            iconColor={theme.colors.secondary}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  composer: {
    margin: UI.screenPadding,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    overflow: 'hidden',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    borderRadius: 14,
    paddingRight: 4,
    paddingLeft: 0,
  },
  leftTools: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
    paddingLeft: 2,
  },
  toolBtn: { margin: 0 },
  input: { flex: 1, backgroundColor: 'transparent', marginVertical: 6 },
});
