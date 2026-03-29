export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  recipe?: { title: string; ingredients: string[]; steps: string[]; description?: string };
};

export function makeChatId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatRecipeText(recipe: NonNullable<ChatMessage['recipe']>) {
  const lines: string[] = [];
  lines.push(recipe.title);
  if (recipe.description) lines.push(recipe.description);
  lines.push('');
  lines.push('Ingredients');
  for (const i of recipe.ingredients) lines.push(`- ${i}`);
  lines.push('');
  lines.push('Steps');
  recipe.steps.forEach((s, idx) => lines.push(`${idx + 1}. ${s}`));
  return lines.join('\n');
}

export function labelCuisine(c: string) {
  if (c === 'any-asian') return 'Any Asian';
  return c
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}
