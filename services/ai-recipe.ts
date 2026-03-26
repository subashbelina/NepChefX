export type AiRecipeResult = {
  title: string;
  ingredients: string[];
  steps: string[];
  description?: string;
};

/** Tried in order until one works with your enabled Inference Providers. */
const HF_MODEL_FALLBACKS = [
  'Qwen/Qwen2.5-3B-Instruct:cheapest',
  'meta-llama/Llama-3.2-3B-Instruct:fastest',
  'openai/gpt-oss-120b:cheapest',
] as const;

export type AiRecipeMode = 'from-ingredients' | 'surprise';

export type AiRecipeOptions = {
  mode?: AiRecipeMode;
  /** Cuisine / region style. Use 'any-asian' for general Asian cuisine. */
  cuisine?:
    | 'any-asian'
    | 'nepali'
    | 'indian'
    | 'thai'
    | 'japanese'
    | 'korean'
    | 'chinese'
    | 'vietnamese'
    | 'filipino'
    | 'malaysian'
    | 'indonesian'
    | 'sri-lankan'
    | 'tibetan'
    | 'mongolian'
    | 'other';
  mealFocus?: 'any' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
  spiceLevel?: 'any' | 'mild' | 'medium' | 'hot';
  extraNotes?: string;
  /** Slightly more variation on regenerate */
  creative?: boolean;
};

function requireOpenAiKey() {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
  return apiKey;
}

function extFromUri(uri: string) {
  const m = uri.toLowerCase().match(/\.(png|jpg|jpeg|webp|heic|heif)$/);
  const ext = m?.[1] ?? 'jpg';
  return ext === 'jpeg' ? 'jpg' : ext;
}

function contentTypeFromExt(ext: string) {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return 'image/jpeg';
}

function getHfModelCandidates(): string[] {
  const fromEnv = process.env.EXPO_PUBLIC_HF_MODEL?.trim();
  const defaults = [...HF_MODEL_FALLBACKS];
  if (fromEnv) {
    const rest = defaults.filter((d) => d.split(':')[0] !== fromEnv.split(':')[0]);
    return [fromEnv, ...rest];
  }
  return [...defaults];
}

function parseRecipeJson(raw: string): AiRecipeResult {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf('{');
  if (start === -1) throw new Error('Model did not return JSON');

  // Some models prepend/append extra text. Try progressively shorter tails until JSON.parse works.
  const endCandidates: number[] = [];
  for (let i = text.length - 1; i >= start; i--) {
    if (text[i] === '}') endCandidates.push(i);
  }
  if (endCandidates.length === 0) throw new Error('Model did not return JSON');

  let lastParseErr: unknown = null;
  for (const end of endCandidates) {
    const slice = text.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice) as AiRecipeResult;
      if (!parsed?.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid recipe JSON shape from model');
      }
      return parsed;
    } catch (e) {
      lastParseErr = e;
      continue;
    }
  }

  throw lastParseErr instanceof Error ? lastParseErr : new Error('Model returned non-JSON text');
}

function buildRecipeUserPrompt(ingredients: string[], options?: AiRecipeOptions): string {
  const mode = options?.mode ?? 'from-ingredients';
  const cuisine = options?.cuisine ?? 'any-asian';
  const meal = options?.mealFocus && options.mealFocus !== 'any' ? options.mealFocus : null;
  const spice = options?.spiceLevel && options.spiceLevel !== 'any' ? options.spiceLevel : null;
  const notes = options?.extraNotes?.trim();

  const lines: string[] = [
    cuisine === 'nepali'
      ? 'Create a Nepali recipe.'
      : cuisine === 'any-asian'
        ? 'Create an Asian cuisine recipe (can be Thai, Japanese, Korean, Chinese, Indian, Nepali, Vietnamese, etc.).'
        : cuisine === 'other'
          ? 'Create an Asian-inspired recipe.'
          : `Create a ${cuisine.replace(/-/g, ' ')} recipe.`,
    'Reply with ONLY valid JSON — no markdown fences, no extra text.',
    'Must be exactly this shape:',
    '{"title":"string","description":"string","ingredients":["..."],"steps":["..."]}',
  ];

  if (cuisine && cuisine !== 'other') {
    // Extra explicit hint to reduce "Nepali-only" bias from system prompt / previous behavior.
    if (cuisine === 'any-asian') lines.push('Cuisine: any Asian (choose the best fit).');
    else if (cuisine !== 'nepali') lines.push(`Cuisine: ${cuisine.replace(/-/g, ' ')}.`);
  }
  if (meal) lines.push(`Meal: ${meal}.`);
  if (spice) lines.push(`Spice heat: ${spice}.`);
  if (notes) lines.push(`Extra: ${notes}`);

  if (mode === 'surprise') {
    lines.push(
      ingredients.length > 0
        ? `Optional pantry hints (use as inspiration, you may add more): ${ingredients.join(', ')}.`
        : 'Invent a complete recipe with a realistic ingredient list and clear steps.'
    );
  } else {
    lines.push(`Must use these ingredients (pantry staples allowed): ${ingredients.join(', ')}.`);
  }

  return lines.join('\n');
}

/**
 * Hugging Face router — tries several models if yours isn’t enabled in Inference Providers.
 */
async function generateWithHuggingFace(
  ingredients: string[],
  options?: AiRecipeOptions
): Promise<AiRecipeResult> {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN?.trim();
  if (!token) {
    throw new Error('Missing EXPO_PUBLIC_HF_TOKEN (add to .env — see .env.example)');
  }

  const url = 'https://router.huggingface.co/v1/chat/completions';
  const userContent = buildRecipeUserPrompt(ingredients, options);
  const temperature = options?.creative ? 0.75 : 0.4;

  const systemContent =
    'You are a recipe assistant. Output a single JSON object only. Keys: title, description, ingredients (array of strings), steps (array of strings).';

  const models = getHfModelCandidates();
  let lastErr = '';

  for (const model of models) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        temperature,
        // OpenAI-compatible router: request structured JSON when supported by the provider/model.
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
      }),
    });

    const text = await res.text();

    if (res.ok) {
      let data: {
        choices?: Array<{ message?: { content?: string | null } }>;
        error?: { message?: string };
      };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        lastErr = 'invalid JSON from router';
        continue;
      }
      if (data.error?.message) {
        lastErr = data.error.message;
        continue;
      }
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        lastErr = 'empty content';
        continue;
      }
      try {
        return parseRecipeJson(content);
      } catch {
        lastErr = 'model returned non-JSON text';
        continue;
      }
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(`Hugging Face auth ${res.status}: ${text.slice(0, 400)}`);
    }

    const unsupported =
      res.status === 400 &&
      (text.includes('model_not_supported') ||
        text.includes('not supported by any provider') ||
        text.includes('"code":"model_not_supported"'));

    lastErr = `model ${model}: ${text.slice(0, 280)}`;
    if (!unsupported) {
      throw new Error(`Hugging Face error ${res.status}: ${text.slice(0, 500)}`);
    }
  }

  throw new Error(
    `No Hugging Face model worked. Enable providers at https://huggingface.co/settings/inference-providers ` +
      `or set EXPO_PUBLIC_HF_MODEL to a model you can run. Last error: ${lastErr.slice(0, 220)}`
  );
}

async function generateWithOpenAI(ingredients: string[], options?: AiRecipeOptions): Promise<AiRecipeResult> {
  const apiKey = requireOpenAiKey();

  const userContent = buildRecipeUserPrompt(ingredients, options);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: options?.creative ? 0.8 : 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a recipe assistant. Return only JSON with keys title, description, ingredients (array of strings), steps (array of strings).',
        },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${msg.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');

  return parseRecipeJson(content);
}

export async function extractIngredientsFromImageOpenAI(params: { base64: string; mimeType: string }) {
  const apiKey = requireOpenAiKey();

  const system =
    'You are a cooking assistant. Extract visible ingredients from the image. Reply ONLY JSON: {"ingredients":["..."]}.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'List the ingredients you can see. Use short names.' },
            {
              type: 'image_url',
              image_url: { url: `data:${params.mimeType};base64,${params.base64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`OpenAI vision error: ${res.status} ${msg.slice(0, 400)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');
  const parsed = JSON.parse(content) as { ingredients?: unknown };
  const list = Array.isArray(parsed.ingredients) ? parsed.ingredients.filter((x) => typeof x === 'string' && x.trim()) : [];
  return list as string[];
}

export async function transcribeAudioOpenAI(params: { uri: string }): Promise<string> {
  const apiKey = requireOpenAiKey();

  const form = new FormData();
  form.append('model', 'gpt-4o-mini-transcribe');
  form.append('file', {
    // @ts-expect-error React Native FormData file
    uri: params.uri,
    name: `audio-${Date.now()}.m4a`,
    type: 'audio/m4a',
  });

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`OpenAI transcription error: ${res.status} ${msg.slice(0, 400)}`);
  }

  const data = (await res.json()) as { text?: string };
  const text = data.text?.trim();
  if (!text) throw new Error('Transcription returned empty text');
  return text;
}

export function guessImageMimeTypeFromUri(uri: string) {
  const ext = extFromUri(uri);
  return contentTypeFromExt(ext);
}

/**
 * Generate a recipe via HF (if token set) or OpenAI.
 */
export async function generateRecipeWithAi(ingredients: string[], options?: AiRecipeOptions) {
  const hf = process.env.EXPO_PUBLIC_HF_TOKEN?.trim();
  if (hf) {
    return generateWithHuggingFace(ingredients, options);
  }
  const openai = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  if (openai) {
    return generateWithOpenAI(ingredients, options);
  }
  throw new Error('Add EXPO_PUBLIC_HF_TOKEN or EXPO_PUBLIC_OPENAI_API_KEY to .env (see .env.example)');
}

/** @deprecated use `generateRecipeWithAi` */
export async function generateRecipeFromIngredients(ingredients: string[]) {
  return generateRecipeWithAi(ingredients, { mode: 'from-ingredients' });
}

export function parseIngredientsInput(text: string): string[] {
  const lines = text.split(/\r?\n/g).map((s) => s.trim()).filter(Boolean);
  if (lines.length === 1 && lines[0].includes(',')) {
    return lines[0].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return lines;
}

export function isAiRecipeConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_HF_TOKEN?.trim() || process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim()
  );
}
