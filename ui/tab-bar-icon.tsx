import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';

type Accent = 'primary' | 'secondary' | 'tertiary';

const ICON_SIZE = 24;
const ICON_SIZE_FOCUSED = 26;
const ADD_SIZE = 26;
const ADD_SIZE_FOCUSED = 30;

function containerForAccent(theme: MD3Theme, accent: Accent, focused: boolean) {
  if (!focused) return 'transparent';
  switch (accent) {
    case 'secondary':
      return theme.colors.secondaryContainer;
    case 'tertiary':
      return theme.colors.tertiaryContainer;
    default:
      return theme.colors.primaryContainer;
  }
}

function colorForAccent(theme: MD3Theme, accent: Accent, focused: boolean, fallback: string) {
  if (!focused) return fallback;
  switch (accent) {
    case 'secondary':
      return theme.colors.secondary;
    case 'tertiary':
      return theme.colors.tertiary;
    default:
      return theme.colors.primary;
  }
}

type Props = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  focused: boolean;
  color: string;
  accent?: Accent;
  /** Center “Add” tab — slightly larger icon */
  prominent?: boolean;
};

export function TabBarIcon({ name, focused, color, accent = 'primary', prominent }: Props) {
  const theme = useTheme();
  const bg = containerForAccent(theme, accent, focused);
  const fg = colorForAccent(theme, accent, focused, color);
  const size = prominent ? (focused ? ADD_SIZE_FOCUSED : ADD_SIZE) : focused ? ICON_SIZE_FOCUSED : ICON_SIZE;

  return (
    <View
      style={[
        styles.slot,
        prominent && styles.slotProminent,
        { backgroundColor: bg },
        focused && styles.slotFocused,
      ]}>
      <MaterialCommunityIcons name={name} color={fg} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotProminent: {
    width: 52,
    height: 36,
    borderRadius: 18,
  },
  slotFocused: {
    transform: [{ scale: 1.02 }],
  },
});
