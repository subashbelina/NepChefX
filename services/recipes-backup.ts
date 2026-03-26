import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

import type { Recipe } from '@/types/recipe';
import { isAppManagedRecipeImage, writeCoverFromBase64 } from '@/services/recipe-images';

type BackupEnvelopeV1 = {
  schemaVersion: 1;
  exportedAt: number;
  app: 'NepChefX';
  recipes: Recipe[];
};

type BackupImageAsset = {
  fileName: string;
  mimeType: string;
  base64: string;
};

type BackupEnvelopeV2 = {
  schemaVersion: 2;
  exportedAt: number;
  app: 'NepChefX';
  recipes: (Omit<Recipe, 'imageUri'> & { imageKey?: string })[];
  images: BackupImageAsset[];
};

function makeFileSafeStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds(),
  )}`;
}

export async function exportRecipesToJson(recipes: Recipe[]) {
  const exportedAt = Date.now();
  const images: BackupImageAsset[] = [];
  const imageKeyByUri = new Map<string, string>();

  const recipePayload: BackupEnvelopeV2['recipes'] = [];
  for (const r of recipes) {
    let imageKey: string | undefined;
    if (r.imageUri && r.imageUri.startsWith('file://') && isAppManagedRecipeImage(r.imageUri)) {
      const existing = imageKeyByUri.get(r.imageUri);
      if (existing) {
        imageKey = existing;
      } else {
        const file = new File(r.imageUri);
        const base64 = await file.base64();
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const fileName = file.name || `cover_${r.id}.${ext}`;
        imageKey = fileName;
        imageKeyByUri.set(r.imageUri, imageKey);
        images.push({ fileName, mimeType, base64 });
      }
    }

    const { imageUri, ...rest } = r;
    recipePayload.push({ ...rest, ...(imageKey ? { imageKey } : {}) });
  }

  const env: BackupEnvelopeV2 = {
    schemaVersion: 2,
    exportedAt,
    app: 'NepChefX',
    recipes: recipePayload,
    images,
  };

  const dir = new Directory(Paths.document, 'backups');
  dir.create({ intermediates: true, idempotent: true });

  const fileName = `nepchefx-recipes_${makeFileSafeStamp()}.json`;
  const out = dir.createFile(fileName, 'application/json');
  out.create({ overwrite: true });
  out.write(JSON.stringify(env, null, 2), { encoding: 'utf8' });

  if ((await Sharing.isAvailableAsync()) && Platform.OS !== 'web') {
    await Sharing.shareAsync(out.uri, {
      dialogTitle: 'Export NepChefX backup',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
  }

  return { uri: out.uri, fileName, count: recipes.length };
}

function parseBackupJson(text: string): { recipes: Recipe[]; images: BackupImageAsset[] } {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return { recipes: parsed as Recipe[], images: [] };
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Partial<BackupEnvelopeV2> & Partial<BackupEnvelopeV1>;
    if (obj.app === 'NepChefX' && obj.schemaVersion === 2 && Array.isArray(obj.recipes)) {
      const recipes = (obj.recipes as any[]).map((r) => {
        const { imageKey, ...rest } = r ?? {};
        return { ...(rest as Recipe), imageUri: typeof imageKey === 'string' ? `imageKey:${imageKey}` : undefined };
      });
      return { recipes: recipes as Recipe[], images: Array.isArray(obj.images) ? (obj.images as BackupImageAsset[]) : [] };
    }
    if (obj.app === 'NepChefX' && obj.schemaVersion === 1 && Array.isArray(obj.recipes)) {
      return { recipes: obj.recipes as Recipe[], images: [] };
    }
    if (Array.isArray((obj as any).recipes)) return { recipes: (obj as any).recipes as Recipe[], images: [] };
  }
  throw new Error('Invalid backup format');
}

function normalizeImported(recipes: Recipe[]): Recipe[] {
  const now = Date.now();
  const seen = new Set<string>();
  const out: Recipe[] = [];

  for (const r of recipes) {
    if (!r || typeof r !== 'object') continue;
    const id = typeof r.id === 'string' && r.id.trim() ? r.id : `${now}-${Math.random().toString(16).slice(2)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const title = typeof r.title === 'string' ? r.title.trim() : '';
    const ingredients = Array.isArray(r.ingredients) ? r.ingredients.filter((x) => typeof x === 'string' && x.trim()) : [];
    const steps = Array.isArray(r.steps) ? r.steps.filter((x) => typeof x === 'string' && x.trim()) : [];
    if (!title || ingredients.length === 0 || steps.length === 0) continue;

    out.push({
      id,
      title,
      description: typeof r.description === 'string' ? r.description : steps[0]!.slice(0, 80),
      ingredients,
      steps,
      imageUri: typeof r.imageUri === 'string' && r.imageUri.trim() ? r.imageUri : undefined,
      isFavorite: !!r.isFavorite,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    });
  }

  return out;
}

export async function pickAndReadRecipesBackup(): Promise<{ recipes: Recipe[]; pickedName: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (res.canceled) return null;
  const asset = res.assets[0];
  if (!asset) return null;

  // Use expo-file-system File API to read.
  const file = new File(asset.uri);
  const text = await file.text();
  const parsed = parseBackupJson(text);
  const list = normalizeImported(parsed.recipes);

  // Hydrate cover images (native only). If not possible, we keep recipes without images.
  if (Platform.OS !== 'web' && parsed.images.length > 0) {
    const map = new Map(parsed.images.map((i) => [i.fileName, i]));
    for (const r of list) {
      if (!r.imageUri || !r.imageUri.startsWith('imageKey:')) continue;
      const key = r.imageUri.replace(/^imageKey:/, '');
      const img = map.get(key);
      if (!img) {
        r.imageUri = undefined;
        continue;
      }
      try {
        r.imageUri = await writeCoverFromBase64({ base64: img.base64, fileName: img.fileName });
      } catch {
        r.imageUri = undefined;
      }
    }
  } else {
    // Remove placeholder imageKey refs if we can't hydrate.
    for (const r of list) {
      if (r.imageUri?.startsWith('imageKey:')) r.imageUri = undefined;
    }
  }

  return { recipes: list, pickedName: asset.name ?? 'backup.json' };
}

