import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { brandPrimaryPillHairline } from '@/constants/brand-chrome';
import { BrandLogo } from '@/ui/brand-logo';

import {
  favoritesCardBorder,
  favoritesImportPill,
  favoritesWarmBackground,
} from '../favorites-chrome';

type Props = {
  savedCount: number;
  onImport: () => void | Promise<void>;
  onExport: () => void | Promise<void>;
};

export function FavoritesHeader({ savedCount, onImport, onExport }: Props) {
  const theme = useTheme();
  const warm = favoritesWarmBackground(theme);
  const border = favoritesCardBorder(theme);
  const importPill = favoritesImportPill(theme);

  return (
    <Surface elevation={1} style={[styles.topBar, { backgroundColor: warm, borderColor: border }]}>
      <View style={styles.topBarLeft}>
        <View style={[styles.logoTile, { backgroundColor: theme.colors.secondaryContainer }]}>
          <BrandLogo size={26} backing="light" borderRadius={10} />
        </View>
        <View style={styles.titleBlock}>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onPrimaryContainer }]}>
            Favorites
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.88 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>{savedCount}</Text>
            <Text> saved</Text>
          </Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <Pressable
          onPress={() => void onImport()}
          accessibilityRole="button"
          accessibilityLabel="Import backup from file"
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Surface
            elevation={0}
            style={[
              styles.roundAction,
              {
                backgroundColor: importPill.backgroundColor,
                borderColor: importPill.borderColor,
              },
            ]}>
            <MaterialCommunityIcons name="cloud-download-outline" size={20} color={theme.colors.secondary} />
          </Surface>
        </Pressable>

        <Pressable
          onPress={() => void onExport()}
          accessibilityRole="button"
          accessibilityLabel="Export backup to file"
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Surface
            elevation={0}
            style={[
              styles.roundAction,
              {
                backgroundColor: theme.colors.primary,
                borderColor: brandPrimaryPillHairline(theme.dark),
              },
            ]}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={theme.colors.onPrimary} />
          </Surface>
        </Pressable>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
  topBar: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logoTile: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleBlock: { gap: 2, flex: 1 },
  title: { fontWeight: '800' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roundAction: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
