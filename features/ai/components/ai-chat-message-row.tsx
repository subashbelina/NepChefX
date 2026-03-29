import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { brandCyanBorder } from '@/constants/brand-chrome';

import type { ChatMessage } from '../chat-model';

type Props = {
  item: ChatMessage;
  onSaveRecipe: (m: ChatMessage) => void;
};

export function AiChatMessageRow({ item, onSaveRecipe }: Props) {
  const theme = useTheme();
  const cyanBorder = brandCyanBorder(theme.dark);

  const isUser = item.role === 'user';
  const isSystem = item.role === 'system';

  const bubbleBg = isSystem
    ? theme.colors.secondaryContainer
    : isUser
      ? theme.colors.primaryContainer
      : theme.colors.surface;
  const bubbleText = isSystem
    ? theme.colors.onSecondaryContainer
    : isUser
      ? theme.colors.onPrimaryContainer
      : theme.colors.onSurface;
  const bubbleBorder = isUser ? theme.colors.outlineVariant : cyanBorder;

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <Surface
        elevation={isSystem ? 0 : 1}
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderColor: bubbleBorder,
          },
          isUser ? styles.userBubble : null,
          isSystem ? styles.systemBubble : null,
        ]}>
        <Text variant="bodyMedium" style={{ color: bubbleText, lineHeight: 20 }}>
          {item.text}
        </Text>

        {item.role === 'assistant' && item.recipe ? (
          <View style={styles.bubbleActions}>
            <Surface
              elevation={0}
              style={[
                styles.savePill,
                {
                  backgroundColor: theme.colors.secondaryContainer,
                  borderColor: cyanBorder,
                },
              ]}>
              <Text
                onPress={() => onSaveRecipe(item)}
                variant="labelLarge"
                style={{ color: theme.colors.onSecondaryContainer }}>
                Save recipe
              </Text>
            </Surface>
          </View>
        ) : null}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
