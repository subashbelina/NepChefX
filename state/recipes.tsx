import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  countRecipes,
  deleteRecipeRow,
  initRecipesDatabase,
  insertRecipe,
  loadAllRecipes,
  setRecipeFavorite,
} from '@/services/recipes-db';
import { exportRecipesToJson, pickAndReadRecipesBackup } from '@/services/recipes-backup';
import { isAppManagedRecipeImage, persistPickedCoverImage } from '@/services/recipe-images';
import { isSupabaseConfigured } from '@/services/supabase';
import { uploadRecipeImageToSupabase } from '@/services/recipe-images-supabase';
import {
  supabaseDeleteRecipe,
  supabaseLoadAllRecipes,
  supabaseSetFavorite,
  supabaseUpsertRecipe,
  supabaseUpsertRecipeWithImageMeta,
} from '@/services/recipes-supabase';
import type { Recipe } from '@/types/recipe';

export type { Recipe };

type AddRecipeInput = {
  title: string;
  ingredientsText: string;
  stepsText: string;
  imageUri?: string;
};

type RecipesContextValue = {
  recipes: Recipe[];
  addRecipe: (input: AddRecipeInput) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getById: (id: string) => Recipe | undefined;
  exportBackup: () => Promise<{ uri: string; fileName: string; count: number }>;
  importBackup: () => Promise<{ imported: number; total: number; pickedName: string } | null>;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

function splitLines(text: string) {
  return text
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedRecipes: Recipe[] = [
  {
    id: 'seed-1',
    title: 'Spicy Tomato Egg Curry',
    description: 'Cozy, quick curry with eggs and warm spices.',
    ingredients: ['Eggs', 'Tomatoes', 'Onion', 'Garlic', 'Ginger', 'Chili', 'Cumin', 'Salt'],
    steps: [
      'Boil eggs, peel, and lightly score.',
      'Sauté onion, garlic, ginger; add spices and tomatoes.',
      'Simmer sauce, add eggs, and finish with herbs.',
    ],
    isFavorite: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'seed-2',
    title: 'Green Veggie Fried Rice',
    description: 'Bright, garlicky rice with green veggies.',
    ingredients: ['Cooked rice', 'Green beans', 'Peas', 'Scallions', 'Soy sauce', 'Garlic', 'Oil'],
    steps: ['Stir-fry garlic and veggies.', 'Add rice, season, and toss until hot.', 'Finish with scallions.'],
    isFavorite: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

const useNativeSqlite = Platform.OS !== 'web';

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() => (useNativeSqlite ? [] : seedRecipes));
  const dbReady = useRef<Promise<SQLiteDatabase> | null>(null);

  useEffect(() => {
    if (!useNativeSqlite) return;

    dbReady.current = (async () => {
      const db = await openDatabaseAsync('nepchefx-recipes.db');
      await initRecipesDatabase(db);
      const n = await countRecipes(db);
      if (n === 0) {
        for (const r of seedRecipes) {
          await insertRecipe(db, r);
        }
      }
      const list = await loadAllRecipes(db);
      setRecipes(list);

      // Optional cloud sync (Supabase) if configured.
      // Behavior:
      // - If Supabase is empty, we seed it from local.
      // - If Supabase has data, we treat it as the latest and mirror into local DB.
      void (async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const remote = await supabaseLoadAllRecipes();
          if (remote.length === 0 && list.length > 0) {
            for (const r of list) await supabaseUpsertRecipe(r);
            return;
          }
          if (remote.length > 0) {
            for (const r of remote) await insertRecipe(db, r);
            setRecipes(remote);
          }
        } catch {
          // Ignore cloud sync errors; app continues offline/local.
        }
      })();

      // One-time-ish migration: copy any existing cover images into Documents/recipe-images/
      // so they persist and can be included in backups.
      void (async () => {
        const candidates = list.filter((r) => r.imageUri && !isAppManagedRecipeImage(r.imageUri));
        if (candidates.length === 0) return;

        let changed = false;
        for (const r of candidates) {
          try {
            const stable = await persistPickedCoverImage({
              pickedUri: r.imageUri!,
              recipeId: r.id,
              title: r.title,
            });
            if (stable && stable !== r.imageUri) {
              changed = true;
              await insertRecipe(db, { ...r, imageUri: stable });
            }
          } catch {
            // Ignore migration failures (e.g. missing permissions / stale URIs).
          }
        }

        if (changed) {
          const refreshed = await loadAllRecipes(db);
          setRecipes(refreshed);
        }
      })();

      return db;
    })();
  }, []);

  const withDb = useCallback(async (fn: (db: SQLiteDatabase) => Promise<void>) => {
    if (!useNativeSqlite || !dbReady.current) return;
    const db = await dbReady.current;
    await fn(db);
  }, []);

  const addRecipe = useCallback((input: AddRecipeInput) => {
    const title = input.title.trim();
    const ingredients = splitLines(input.ingredientsText);
    const steps = splitLines(input.stepsText);

    if (!title || ingredients.length === 0 || steps.length === 0) return;

    const next: Recipe = {
      id: makeId(),
      title,
      description: steps[0]?.slice(0, 80) ?? 'New recipe',
      ingredients,
      steps,
      imageUri: input.imageUri,
      isFavorite: false,
      createdAt: Date.now(),
    };

    setRecipes((prev) => [next, ...prev]);
    void (async () => {
      let saved = next;
      if (next.imageUri) {
        try {
          const stable = await persistPickedCoverImage({ pickedUri: next.imageUri, recipeId: next.id, title: next.title });
          saved = { ...next, imageUri: stable };
          setRecipes((prev) => prev.map((r) => (r.id === next.id ? saved : r)));
        } catch {
          // If copy fails, we still keep the original uri.
        }
      }
      await withDb((db) => insertRecipe(db, saved));

      // Cloud upsert (best-effort). If there's an image, upload to Storage first.
      void (async () => {
        if (!isSupabaseConfigured()) return;
        try {
          if (saved.imageUri && Platform.OS !== 'web') {
            const up = await uploadRecipeImageToSupabase({ localUri: saved.imageUri, recipeId: saved.id, fileBaseName: saved.title });
            const cloudRecipe: Recipe = { ...saved, imageUri: up.publicUrl };

            // Mirror the public URL locally too (so other devices match).
            setRecipes((prev) => prev.map((r) => (r.id === saved.id ? cloudRecipe : r)));
            await withDb((db) => insertRecipe(db, cloudRecipe));

            await supabaseUpsertRecipeWithImageMeta(cloudRecipe, { imageBucket: up.bucket, imagePath: up.path });
            return;
          }

          await supabaseUpsertRecipe(saved);
        } catch {
          // Ignore cloud failures; local save already succeeded.
        }
      })();
    })();
  }, [withDb]);

  const deleteRecipe = useCallback(
    (id: string) => {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      void withDb((db) => deleteRecipeRow(db, id));
      void (async () => {
        if (!isSupabaseConfigured()) return;
        try {
          await supabaseDeleteRecipe(id);
        } catch {
          // Ignore cloud failures.
        }
      })();
    },
    [withDb],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      let nextFav = false;
      setRecipes((prev) => {
        const row = prev.find((r) => r.id === id);
        if (row) nextFav = !row.isFavorite;
        return prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
      });
      void withDb((db) => setRecipeFavorite(db, id, nextFav));
      void (async () => {
        if (!isSupabaseConfigured()) return;
        try {
          await supabaseSetFavorite(id, nextFav);
        } catch {
          // Ignore cloud failures.
        }
      })();
    },
    [withDb],
  );

  const getById = useCallback((id: string) => recipes.find((r) => r.id === id), [recipes]);

  const exportBackup = useCallback(async () => {
    return exportRecipesToJson(recipes);
  }, [recipes]);

  const importBackup = useCallback(async () => {
    const picked = await pickAndReadRecipesBackup();
    if (!picked) return null;

    if (useNativeSqlite && dbReady.current) {
      const db = await dbReady.current;
      for (const r of picked.recipes) {
        await insertRecipe(db, r);
      }
      const all = await loadAllRecipes(db);
      setRecipes(all);
      return { imported: picked.recipes.length, total: all.length, pickedName: picked.pickedName };
    }

    // Web (or if DB isn't ready yet): merge into memory.
    let total = 0;
    setRecipes((prev) => {
      const map = new Map(prev.map((r) => [r.id, r] as const));
      for (const r of picked.recipes) map.set(r.id, r);
      const merged = [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
      total = merged.length;
      return merged;
    });
    return { imported: picked.recipes.length, total, pickedName: picked.pickedName };
  }, []);

  const value = useMemo<RecipesContextValue>(
    () => ({ recipes, addRecipe, deleteRecipe, toggleFavorite, getById, exportBackup, importBackup }),
    [recipes, addRecipe, deleteRecipe, toggleFavorite, getById, exportBackup, importBackup],
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipesProvider');
  return ctx;
}
