import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { IconButton, Surface, TextInput, useTheme } from 'react-native-paper';

import { brandOrangeBorder } from '@/constants/brand-chrome';
import { UI } from '@/constants/ui-layout';

import {
  aiComposerFieldOutline,
  aiComposerStripBackground,
  aiComposerToolIcon,
} from '../ai-chrome';

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
  const outerBorder = brandOrangeBorder(theme.dark);
  const stripBg = aiComposerStripBackground(theme);
  const fieldOutline = aiComposerFieldOutline(theme);
  const canUseTools = aiReady && !busy;

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <Surface
        elevation={2}
        style={[
          styles.composer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: outerBorder,
          },
        ]}>
        <View style={styles.composerOverflowClip}>
          <View style={styles.composerPad}>
            <View style={[styles.inputShell, { backgroundColor: stripBg }]}>
              <View style={styles.leftTools}>
                <IconButton
                  icon="camera"
                  onPress={onTakePhoto}
                  disabled={!canUseTools}
                  accessibilityLabel="Take photo"
                  iconColor={aiComposerToolIcon(theme, { active: false })}
                  style={styles.toolBtn}
                />
                <IconButton
                  icon={isRecording ? 'microphone' : 'microphone-outline'}
                  onPress={onToggleMic}
                  disabled={!canUseTools}
                  accessibilityLabel={isRecording ? 'Stop recording' : 'Voice input'}
                  iconColor={aiComposerToolIcon(theme, { active: isRecording })}
                  style={styles.toolBtn}
                />
              </View>
              <TextInput
                mode="outlined"
                value={draft}
                onChangeText={onChangeDraft}
                placeholder="Ingredients or ask for a surprise recipe…"
                multiline
                outlineColor={fieldOutline.idle}
                activeOutlineColor={fieldOutline.focused}
                style={styles.input}
                textColor={theme.colors.onPrimaryContainer}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                editable={canUseTools}
              />
              <IconButton
                icon="send"
                onPress={onSend}
                disabled={!canUseTools || !draft.trim()}
                loading={busy}
                accessibilityLabel="Send"
                iconColor={theme.colors.primary}
              />
            </View>
          </View>
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
  },
  composerOverflowClip: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  composerPad: { padding: 8 },
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
