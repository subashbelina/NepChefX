import type { Recipe } from '@/state/recipes';

/** Curated pantry filters — matchTerms are checked against each ingredient line (smart token + substring). */
export type StapleDefinition = {
  id: string;
  label: string;
  matchTerms: string[];
  /** MaterialCommunityIcons glyph name (must exist in @expo/vector-icons). */
  icon: string;
  category: 'protein' | 'veg' | 'grain' | 'aromatic' | 'dairy' | 'pantry';
};

export const STAPLE_DEFINITIONS: StapleDefinition[] = [
  { id: 'eggs', label: 'Eggs', matchTerms: ['egg'], icon: 'egg-outline', category: 'protein' },
  { id: 'chicken', label: 'Chicken', matchTerms: ['chicken'], icon: 'food-drumstick-outline', category: 'protein' },
  { id: 'fish', label: 'Fish', matchTerms: ['fish', 'salmon', 'tuna', 'prawn', 'shrimp'], icon: 'fish', category: 'protein' },
  { id: 'paneer', label: 'Paneer', matchTerms: ['paneer', 'tofu'], icon: 'cheese', category: 'protein' },
  { id: 'tomato', label: 'Tomato', matchTerms: ['tomato', 'tomatoes'], icon: 'carrot', category: 'veg' },
  { id: 'potato', label: 'Potato', matchTerms: ['potato', 'potatoes'], icon: 'pot-steam-outline', category: 'veg' },
  { id: 'onion', label: 'Onion', matchTerms: ['onion', 'onions', 'scallion', 'scallions', 'shallot'], icon: 'leaf', category: 'veg' },
  { id: 'mushroom', label: 'Mushroom', matchTerms: ['mushroom', 'mushrooms'], icon: 'mushroom-outline', category: 'veg' },
  { id: 'greens', label: 'Greens', matchTerms: ['spinach', 'kale', 'cabbage', 'greens', 'lettuce'], icon: 'sprout-outline', category: 'veg' },
  { id: 'rice', label: 'Rice', matchTerms: ['rice'], icon: 'rice', category: 'grain' },
  { id: 'lentils', label: 'Lentils', matchTerms: ['lentil', 'dal', 'daal', 'legume'], icon: 'bowl-mix-outline', category: 'grain' },
  { id: 'noodles', label: 'Noodles', matchTerms: ['noodle', 'noodles', 'pasta'], icon: 'noodles', category: 'grain' },
  { id: 'garlic', label: 'Garlic', matchTerms: ['garlic'], icon: 'clover-outline', category: 'aromatic' },
  { id: 'ginger', label: 'Ginger', matchTerms: ['ginger'], icon: 'grain', category: 'aromatic' },
  { id: 'chili', label: 'Chili', matchTerms: ['chili', 'chilli', 'chile'], icon: 'chili-mild-outline', category: 'aromatic' },
  { id: 'cumin', label: 'Cumin', matchTerms: ['cumin', 'coriander', 'turmeric', 'masala', 'garam'], icon: 'shaker-outline', category: 'aromatic' },
  { id: 'soy', label: 'Soy', matchTerms: ['soy', 'miso', 'tamari'], icon: 'soy-sauce', category: 'pantry' },
  { id: 'coconut', label: 'Coconut', matchTerms: ['coconut'], icon: 'bowl-outline', category: 'pantry' },
];

const STOP_WORDS = new Set([
  'and',
  'or',
  'the',
  'a',
  'fresh',
  'chopped',
  'diced',
  'sliced',
  'minced',
  'grated',
  'large',
  'small',
  'medium',
  'whole',
  'cooked',
  'raw',
  'optional',
  'tbsp',
  'tsp',
  'cup',
  'cups',
  'tablespoon',
  'teaspoon',
  'oz',
  'lb',
  'ml',
  'g',
  'kg',
]);

/**
 * Match a pantry term as a whole word (handles simple plurals) so “egg” does not match “eggplant”.
 */
export function ingredientMatchesTerm(ingredientLine: string, term: string): boolean {
  const line = ingredientLine.toLowerCase();
  const t = term.toLowerCase().trim();
  if (!t) return false;
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}(?:es|s)?\\b`, 'i');
  return re.test(line);
}

export function recipeUsesStaple(recipe: Recipe, matchTerms: string[]): boolean {
  return recipe.ingredients.some((line) => matchTerms.some((term) => ingredientMatchesTerm(line, term)));
}

export function countRecipesForTerms(recipes: Recipe[], matchTerms: string[]): number {
  return recipes.filter((r) => recipeUsesStaple(r, matchTerms)).length;
}

function stapleCoversKeyword(key: string): boolean {
  const k = key.toLowerCase();
  return STAPLE_DEFINITIONS.some((s) =>
    s.matchTerms.some((t) => k === t || k.includes(t) || t.includes(k)),
  );
}

/**
 * Pull extra pantry chips from ingredient lines (keywords your staples list might not name).
 */
function extractKeywordsFromLine(line: string): string[] {
  const cleaned = line.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  if (words.length === 0) return [];
  return [words[0]];
}

export type PantryChip = {
  id: string;
  label: string;
  matchTerms: string[];
  icon: string;
  count: number;
  curated: boolean;
};

/** Build chips: curated staples with counts, plus top “from your recipes” keywords. */
export function buildPantryChips(recipes: Recipe[], maxDynamic = 10): PantryChip[] {
  const curated: PantryChip[] = STAPLE_DEFINITIONS.map((s) => {
    const count = countRecipesForTerms(recipes, s.matchTerms);
    return {
      id: `staple:${s.id}`,
      label: s.label,
      matchTerms: s.matchTerms,
      icon: s.icon,
      count,
      curated: true,
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const keywordRecipeCount = new Map<string, number>();
  for (const r of recipes) {
    const keysInRecipe = new Set<string>();
    for (const line of r.ingredients) {
      for (const kw of extractKeywordsFromLine(line)) {
        keysInRecipe.add(kw.toLowerCase());
      }
    }
    for (const k of keysInRecipe) {
      keywordRecipeCount.set(k, (keywordRecipeCount.get(k) ?? 0) + 1);
    }
  }

  const dynamic: PantryChip[] = [];
  const sortedKeys = [...keywordRecipeCount.entries()].sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sortedKeys) {
    if (dynamic.length >= maxDynamic) break;
    if (stapleCoversKeyword(key)) continue;
    if (STOP_WORDS.has(key)) continue;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    dynamic.push({
      id: `dyn:${key}`,
      label,
      matchTerms: [key],
      icon: 'basket-outline',
      count,
      curated: false,
    });
  }

  const seen = new Set(curated.map((c) => c.label.toLowerCase()));
  const extra = dynamic.filter((d) => !seen.has(d.label.toLowerCase()));

  return [...curated, ...extra];
}

export type PantryFilterSelection = {
  id: string;
  label: string;
  matchTerms: string[];
};

export function recipeMatchesPantryFilter(recipe: Recipe, filter: PantryFilterSelection | null): boolean {
  if (!filter) return true;
  return recipeUsesStaple(recipe, filter.matchTerms);
}
