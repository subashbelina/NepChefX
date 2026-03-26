# NepChefX

Recipe app built with [Expo](https://expo.dev) (SDK 54), [Expo Router](https://docs.expo.dev/router/introduction/), and [React Native Paper](https://callstack.github.io/react-native-paper/).

## Run locally

```bash
npm install
npx expo start
```

## Project layout

| Path | Role |
|------|------|
| `app/` | Routes and layouts (tabs, stack, recipe detail) |
| `features/recipes/components/` | Recipe-specific UI blocks |
| `ui/` | Shared shell: header, brand logo, tab haptics |
| `state/` | App state (e.g. recipes) |
| `services/` | External integrations (e.g. AI recipe) |
| `constants/` | Shared tokens (layout, filter presets) |
| `hooks/` | Shared hooks (`useColorScheme`) |
| `assets/images/` | Brand images |
| `scripts/` | Tooling (`assets:square-logo` for Expo icon sizing) |
