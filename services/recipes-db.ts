import type { SQLiteDatabase } from 'expo-sqlite';

import type { Recipe } from '@/types/recipe';

type RecipeRow = {
  id: string;
  title: string;
  description: string;
  ingredients_json: string;
  steps_json: string;
  image_uri: string | null;
  is_favorite: number;
  created_at: number;
};

function rowToRecipe(row: RecipeRow): Recipe {
  let ingredients: string[] = [];
  let steps: string[] = [];
  try {
    ingredients = JSON.parse(row.ingredients_json) as string[];
  } catch {
    ingredients = [];
  }
  try {
    steps = JSON.parse(row.steps_json) as string[];
  } catch {
    steps = [];
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ingredients,
    steps,
    imageUri: row.image_uri ?? undefined,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
  };
}

const DDL = `
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients_json TEXT NOT NULL,
  steps_json TEXT NOT NULL,
  image_uri TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes (created_at DESC);
`;

export async function initRecipesDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(DDL);
}

export async function loadAllRecipes(db: SQLiteDatabase): Promise<Recipe[]> {
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT id, title, description, ingredients_json, steps_json, image_uri, is_favorite, created_at FROM recipes ORDER BY created_at DESC',
  );
  return rows.map(rowToRecipe);
}

export async function countRecipes(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM recipes');
  return row?.c ?? 0;
}

export async function insertRecipe(db: SQLiteDatabase, recipe: Recipe): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO recipes
      (id, title, description, ingredients_json, steps_json, image_uri, is_favorite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipe.id,
      recipe.title,
      recipe.description,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.steps),
      recipe.imageUri ?? null,
      recipe.isFavorite ? 1 : 0,
      recipe.createdAt,
    ],
  );
}

export async function deleteRecipeRow(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

export async function setRecipeFavorite(db: SQLiteDatabase, id: string, isFavorite: boolean): Promise<void> {
  await db.runAsync('UPDATE recipes SET is_favorite = ? WHERE id = ?', [isFavorite ? 1 : 0, id]);
}
