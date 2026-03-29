import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { brandPrimaryPillHairline } from '@/constants/brand-chrome';

import { aiBubbleChrome } from '../ai-chrome';
import type { ChatMessage } from '../chat-model';

type Props = {
  item: ChatMessage;
  onSaveRecipe: (m: ChatMessage) => void;
};

export function AiChatMessageRow({ item, onSaveRecipe }: Props) {
  const theme = useTheme();
  const chrome = aiBubbleChrome(theme, item.role);
  const isUser = item.role === 'user';
  const isSystem = item.role === 'system';

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <Surface
        elevation={chrome.elevation}
        style={[
          styles.bubble,
          {
            backgroundColor: chrome.backgroundColor,
            borderColor: chrome.borderColor,
          },
          isUser ? styles.userBubble : null,
          isSystem ? styles.systemBubble : null,
        ]}>
        <Text variant="bodyMedium" style={{ color: chrome.textColor, lineHeight: 20 }}>
          {item.text}
        </Text>

        {item.role === 'assistant' && item.recipe ? (
          <Button
            mode="contained"
            compact
            onPress={() => onSaveRecipe(item)}
            accessibilityLabel="Save this recipe to your library"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={[styles.saveBtn, { borderColor: brandPrimaryPillHairline(theme.dark) }]}
            contentStyle={styles.saveBtnContent}
            labelStyle={styles.saveBtnLabel}>
            Save recipe
          </Button>
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
  saveBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveBtnContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  saveBtnLabel: { fontWeight: '700' },
});
