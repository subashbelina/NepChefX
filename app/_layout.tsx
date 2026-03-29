import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper';

import { nepChefDarkTheme, nepChefLightTheme } from '@/constants/nepchefx-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RecipesProvider } from '@/state/recipes';

const { LightTheme: PaperNavigationLightTheme, DarkTheme: PaperNavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? nepChefDarkTheme : nepChefLightTheme;
  const navigationTheme = isDark ? PaperNavigationDarkTheme : PaperNavigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <RecipesProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </RecipesProvider>
    </PaperProvider>
  );
}
