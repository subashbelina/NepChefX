import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

/**
 * Empty state for recipe cover — functional placeholder, not a large brand mark.
 * Keeps focus on “add a photo” instead of competing with the form below.
 */
export function CoverPhotoPlaceholder({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add cover photo from library"
      style={({ pressed }) => [
        styles.wrap,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceVariant,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="image-plus-outline" size={28} color={theme.colors.primary} />
      </View>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
        Add cover photo
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        Optional · tap to pick from your library
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 118,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: Platform.OS === 'android' ? 'solid' : 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
