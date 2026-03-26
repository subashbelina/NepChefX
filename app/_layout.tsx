import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { RecipesProvider } from '@/state/recipes';

const { LightTheme: PaperNavigationLightTheme, DarkTheme: PaperNavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const warmLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E65100', // deep orange
    secondary: '#2E7D32', // green
    tertiary: '#C62828', // red
    surface: '#FFF7F2',
    background: '#FFF3E0',
  },
};

const warmDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFB74D',
    secondary: '#81C784',
    tertiary: '#EF9A9A',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? warmDarkTheme : warmLightTheme;
  const navigationTheme = isDark ? PaperNavigationDarkTheme : PaperNavigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <RecipesProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </RecipesProvider>
    </PaperProvider>
  );
}
