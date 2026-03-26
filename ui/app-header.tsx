import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';

import { BrandLogo } from '@/ui/brand-logo';

export function AppHeader({
  title,
  showLogo,
  onBack,
  right,
}: {
  title: string;
  showLogo?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Appbar.Header>
      {onBack ? <Appbar.BackAction onPress={onBack} /> : null}
      {showLogo ? (
        <View style={styles.logoWrap}>
          <BrandLogo size={30} />
        </View>
      ) : null}
      <Appbar.Content title={title} />
      {right}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  logoWrap: { paddingLeft: 8, paddingRight: 4 },
});

