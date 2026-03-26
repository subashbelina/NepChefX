import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const LOGO_SRC = require('@/assets/images/NepChefXlogo.png');

type BrandLogoProps = {
  /** Outer tile size (points). */
  size: number;
  /**
   * Solid backing helps fine logo lines read clearly on gradients and photos.
   * `light` = near-white tile; `none` = transparent (use on already-neutral UI).
   */
  backing?: 'light' | 'none';
  borderRadius?: number;
};

/**
 * NepChefX mark — Expo Image + contain fit so the asset stays sharp and uncropped.
 */
export function BrandLogo({ size, backing = 'light', borderRadius }: BrandLogoProps) {
  const r = borderRadius ?? Math.round(size * 0.26);
  const bg = backing === 'light' ? 'rgba(255,255,255,0.96)' : 'transparent';

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: bg,
          borderWidth: backing === 'light' ? StyleSheet.hairlineWidth : 0,
          borderColor: backing === 'light' ? 'rgba(0,0,0,0.06)' : 'transparent',
        },
      ]}>
      <Image
        source={LOGO_SRC}
        style={styles.img}
        contentFit="contain"
        contentPosition="center"
        cachePolicy="memory-disk"
        transition={0}
        accessibilityLabel="NepChefX logo"
      />
    </View>
  );
}

/**
 * Full-width strip (recipe card cover, featured banner, detail hero) when there is no photo.
 * Light backing + contain keeps the PNG sharp instead of stretching with `cover`.
 */
export function BrandLogoWideFallback({ height }: { height: number }) {
  return (
    <View style={[styles.wide, { height }]}>
      <Image
        source={LOGO_SRC}
        style={styles.wideImg}
        contentFit="contain"
        contentPosition="center"
        cachePolicy="memory-disk"
        transition={0}
        accessibilityLabel="NepChefX logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '88%',
    height: '88%',
  },
  wide: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideImg: {
    width: '70%',
    height: '76%',
  },
});
