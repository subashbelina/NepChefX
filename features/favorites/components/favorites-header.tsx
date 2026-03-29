import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { brandCyanBorder } from '@/constants/brand-chrome';
import { BrandLogo } from '@/ui/brand-logo';

type Props = {
  savedCount: number;
  onImport: () => void | Promise<void>;
  onExport: () => void | Promise<void>;
};

export function FavoritesHeader({ savedCount, onImport, onExport }: Props) {
  const theme = useTheme();
  const border = brandCyanBorder(theme.dark);

  return (
    <Surface
      elevation={1}
      style={[styles.topBar, { backgroundColor: theme.colors.surface, borderColor: border }]}>
      <View style={styles.topBarLeft}>
        <View style={[styles.logoTile, { backgroundColor: theme.colors.secondaryContainer }]}>
          <BrandLogo size={26} backing="light" borderRadius={10} />
        </View>
        <View style={styles.titleBlock}>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            Favorites
          </Text>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            <Text style={{ color: theme.colors.secondary, fontWeight: '700' }}>{savedCount}</Text>
            <Text> saved</Text>
          </Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <Surface
          elevation={0}
          style={[
            styles.roundAction,
            {
              backgroundColor: theme.colors.secondaryContainer,
              borderColor: theme.dark ? 'transparent' : 'rgba(0, 172, 193, 0.2)',
            },
          ]}>
          <MaterialCommunityIcons
            name="cloud-download-outline"
            size={20}
            color={theme.colors.secondary}
            onPress={() => void onImport()}
            accessibilityLabel="Import backup"
          />
        </Surface>

        <Surface
          elevation={0}
          style={[
            styles.roundAction,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.dark ? 'transparent' : 'rgba(191, 54, 12, 0.35)',
            },
          ]}>
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={20}
            color={theme.colors.onPrimary}
            onPress={() => void onExport()}
            accessibilityLabel="Export backup"
          />
        </Surface>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
  },
});
