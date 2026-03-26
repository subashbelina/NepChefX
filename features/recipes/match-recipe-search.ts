import type { Recipe } from '@/state/recipes';

/**
 * Case-insensitive search: every whitespace-separated token must appear somewhere in
 * title, description, ingredients, or steps (substring match).
 */
export function recipeMatchesSearchQuery(recipe: Recipe, rawQuery: string): boolean {
  const trimmed = rawQuery.trim().toLowerCase();
  if (!trimmed) return true;

  const tokens = trimmed.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return true;

  const haystack = [
    recipe.title,
    recipe.description,
    ...recipe.ingredients,
    ...recipe.steps,
  ]
    .join(' \n ')
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}
