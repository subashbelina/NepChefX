# NepChefX

Offline-first recipe notebook with optional cloud sync and an **AI** tab for generating recipes from ingredients, photos, or voice. Built for the **NepChefX** brand (warm orange + cyan accents, navy type).

## Stack

| Layer | Choice |
|--------|--------|
| App runtime | [Expo](https://expo.dev) SDK **54**, React **19**, React Native **0.81** |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based tabs + stack) |
| UI | [React Native Paper](https://callstack.github.io/react-native-paper/) (MD3) + `expo-image` |
| Local data | **SQLite** (`expo-sqlite`) — source of truth on device |
| Optional cloud | **Supabase** (Postgres + Storage) — best-effort sync when configured |
| AI | **Hugging Face** and/or **OpenAI** (see [Environment setup](#environment-setup)) |

New Architecture is enabled (`newArchEnabled` in `app.json`).

## Features

- **Home** — Greeting hero, featured carousel, pantry / quick filters, search (title, ingredients, steps), recipe cards with favorites and cover images.
- **Add recipe** — Multi-step flow: cover photo, details, ingredients (with AI assist), review & save. Brand-tinted sections and chips (meal / spice / cuisine).
- **Favorites** — Saved recipes only, deferred search, **JSON backup import/export** (document picker + sharing).
- **AI** — Chat-style UI: cuisine chips, text prompts, optional **camera** (ingredients) and **mic** (transcription) when OpenAI is configured; save generated recipes to the library.
- **Recipe detail** — Full recipe view, cover add/change/remove, favorite toggle, delete; custom header with back pill.

## Theming & brand

- **`constants/brand-colors.ts`** — Logo-derived palette (navy, orange, cyan, tab dock, carousel, cuisine chip sage, etc.).
- **`constants/nepchefx-theme.ts`** — Paper light/dark themes wired in `app/_layout.tsx`.
- **`constants/brand-chrome.ts`** — Shared hairline borders (cyan/orange/primary/secondary pills).
- **`features/ai/ai-chrome.ts`** & **`features/favorites/favorites-chrome.ts`** — Screen-specific semantic colors (bubbles, composer, warm strips).

Floating **tab bar** uses custom background (`ui/tab-bar-background.tsx`) and icons (`ui/tab-bar-icon.tsx`).

## Run locally

```bash
npm install
npx expo start
```

Platform shortcuts (from `package.json`):

```bash
npm run ios
npm run android
npm run web
npm run lint
```

## Environment setup

Copy the example env file and **restart Expo** after any change:

```bash
cp .env.example .env
```

### AI (text, and photo/voice when using OpenAI)

Configure one or both (see `.env.example` for names and hints):

- **Hugging Face** — `EXPO_PUBLIC_HF_TOKEN` (optional `EXPO_PUBLIC_HF_MODEL`). Used **first** for text recipe generation when set.
- **OpenAI** — `EXPO_PUBLIC_OPENAI_API_KEY`. Used when HF is not set for text; **required** for vision (photo ingredients) and speech transcription in the AI tab.

### Supabase (optional cloud sync + recipe images)

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Then in Supabase:

1. Run the SQL in **`supabase/schema.sql`** (e.g. `public.recipes` + RLS as documented there).
2. Create a Storage bucket **`recipe-images`** (public bucket matches the current client flow).

Behavior: **SQLite stays the local source of truth**; when Supabase is configured, the app syncs recipes (and images) best-effort and merges remote rows without wiping local file-based covers when the server omits `image_uri`.

## Project layout

| Path | Role |
|------|------|
| `app/` | Routes: `(tabs)` (Home, Add, Favorites, AI), stack `recipe/[id]`, root layouts |
| `app/_layout.tsx` | `PaperProvider`, `RecipesProvider`, stack + `StatusBar` |
| `features/recipes/components/` | Home blocks, carousel, hero, add-recipe steps, recipe list item |
| `features/favorites/` | Favorites screen modules + `favorites-chrome.ts` |
| `features/ai/` | AI chat model, UI components + `ai-chrome.ts` |
| `ui/` | `AppHeader`, `BrandLogo`, tab bar chrome, haptics |
| `state/recipes.tsx` | Recipe context: SQLite, Supabase hooks, backup, favorites, covers |
| `services/` | `recipes-db`, `recipes-supabase`, `recipe-images`, `recipes-backup`, `ai-recipe`, `supabase` |
| `constants/` | `brand-colors`, `brand-chrome`, `nepchefx-theme`, `ui-layout`, `chef-staples` |
| `types/` | Shared types (e.g. `Recipe`) |
| `hooks/` | `useColorScheme` (light/dark) |
| `assets/images/` | Brand assets (e.g. `NepChefXlogo.png`) |
| `supabase/` | SQL schema for optional backend |
| `scripts/` | `npm run assets:square-logo` — square icon helper (`square-logo.js`) |

## Implementation notes

- Elevated **Paper `Surface`** components avoid **`overflow: 'hidden'`** on the same node as `elevation`; clipping uses an inner **`View`** so shadows render correctly.
- Home list uses memoized rows and deferred search where appropriate to keep lists smooth.

## Secrets

Do not commit real API keys. Use `.env` (gitignored) and `.env.example` only for variable names and placeholders.
