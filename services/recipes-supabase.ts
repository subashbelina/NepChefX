import type { Recipe } from '@/types/recipe';
import { supabase } from '@/services/supabase';

type RecipeRow = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image_uri: string | null;
  image_bucket: string;
  image_path: string | null;
  is_favorite: boolean;
  created_at: number;
};

export type RecipeCloudImageMeta = {
  imageBucket?: string;
  imagePath?: string | null;
};

function rowToRecipe(r: RecipeRow): Recipe {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    imageUri: r.image_uri ?? undefined,
    isFavorite: !!r.is_favorite,
    createdAt: typeof r.created_at === 'number' ? r.created_at : Date.now(),
  };
}

type RecipeUpsertRow = Pick<
  RecipeRow,
  'id' | 'title' | 'description' | 'ingredients' | 'steps' | 'image_uri' | 'is_favorite' | 'created_at'
> &
  Partial<Pick<RecipeRow, 'image_bucket' | 'image_path'>>;

function recipeToRow(r: Recipe, meta?: RecipeCloudImageMeta): RecipeUpsertRow {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    ingredients: r.ingredients,
    steps: r.steps,
    image_uri: r.imageUri ?? null,
    ...(meta?.imageBucket ? { image_bucket: meta.imageBucket } : {}),
    ...(typeof meta?.imagePath === 'string' || meta?.imagePath === null ? { image_path: meta.imagePath } : {}),
    is_favorite: r.isFavorite,
    created_at: r.createdAt,
  };
}

export async function supabaseLoadAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id,title,description,ingredients,steps,image_uri,image_bucket,image_path,is_favorite,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(rowToRecipe);
}

export async function supabaseUpsertRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase.from('recipes').upsert(recipeToRow(recipe));
  if (error) throw error;
}

export async function supabaseUpsertRecipeWithImageMeta(recipe: Recipe, meta: RecipeCloudImageMeta): Promise<void> {
  const { error } = await supabase.from('recipes').upsert(recipeToRow(recipe, meta));
  if (error) throw error;
}

export async function supabaseDeleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function supabaseSetFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase.from('recipes').update({ is_favorite: isFavorite }).eq('id', id);
  if (error) throw error;
}

