import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Brand } from '@/constants/brand-colors';

/**
 * Rounded “floating dock” shell for the bottom tab bar (shadow outside, clip inside).
 */
export function TabBarBackground() {
  const theme = useTheme();
  const isDark = theme.dark === true;

  return (
    <View style={styles.shadowWrap} pointerEvents="none">
      <View
        style={[
          styles.inner,
          {
            backgroundColor: isDark ? Brand.tabBarDockDark : Brand.tabBarDockLight,
            borderColor: isDark ? Brand.tabBarDockBorderDark : Brand.tabBarDockBorderLight,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: Brand.navy,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  inner: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
