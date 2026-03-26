# NepChefX

Recipe app built with [Expo](https://expo.dev) (SDK 54), [Expo Router](https://docs.expo.dev/router/introduction/), and [React Native Paper](https://callstack.github.io/react-native-paper/).

## Run locally

```bash
npm install
npx expo start
```

## Environment setup

Copy the example env file and restart Expo after changes:

```bash
cp .env.example .env
```

### AI (text recipes)

Choose one (or both):

- **Hugging Face** (recommended for text): set `EXPO_PUBLIC_HF_TOKEN` (and optionally `EXPO_PUBLIC_HF_MODEL`)
- **OpenAI**: set `EXPO_PUBLIC_OPENAI_API_KEY`

Notes:

- If both are set, the app uses **Hugging Face first** for text recipe generation.
- **Photo + voice** features in the AI chat require **OpenAI** (vision + transcription).

### Supabase (optional cloud sync + image storage)

If you want cloud sync across devices, set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Supabase “anon/public” or “publishable” key)

Then in Supabase:

1. Run the SQL in `supabase/schema.sql` (creates `public.recipes` and enables RLS with a dev-only anon policy).
2. Create a Storage bucket named `recipe-images` (public bucket recommended for the current implementation).

Behavior:

- **SQLite remains the source of truth locally** (offline-first).
- When Supabase is configured, the app will **best-effort sync** recipes to/from Supabase.

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
