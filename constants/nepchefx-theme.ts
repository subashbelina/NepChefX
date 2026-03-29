import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { Brand } from '@/constants/brand-colors';

/**
 * Material Design 3 themes for PaperProvider — uses logo-derived primaries.
 */
export const nepChefLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Brand.orange,
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFE8DB',
    onPrimaryContainer: '#3B1700',
    secondary: Brand.cyan,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#C5F2F7',
    onSecondaryContainer: '#002F36',
    tertiary: Brand.red,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFDAD6',
    onTertiaryContainer: '#410002',
    background: '#EEF4FA',
    onBackground: Brand.navy,
    surface: '#FAFCFF',
    onSurface: Brand.navy,
    surfaceVariant: '#E1E8F0',
    onSurfaceVariant: '#434E5F',
    outline: '#727F96',
    outlineVariant: '#C4CCD9',
    elevation: MD3LightTheme.colors.elevation,
  },
};

export const nepChefDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFB687',
    onPrimary: '#4A2400',
    primaryContainer: '#733510',
    onPrimaryContainer: '#FFDCC4',
    secondary: '#5DD5E8',
    onSecondary: '#00363E',
    secondaryContainer: '#004F59',
    onSecondaryContainer: '#A3EEF9',
    tertiary: '#FFB4AB',
    onTertiary: '#690007',
    tertiaryContainer: '#93000E',
    onTertiaryContainer: '#FFDAD6',
    background: '#0C1218',
    onBackground: '#E1E8F0',
    surface: '#141C26',
    onSurface: '#E1E8F0',
    surfaceVariant: '#3A4556',
    onSurfaceVariant: '#B8C4D6',
    outline: '#8E9AAF',
    outlineVariant: '#434E5F',
    elevation: MD3DarkTheme.colors.elevation,
  },
};
