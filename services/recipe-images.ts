import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

const IMAGES_DIR = new Directory(Paths.document, 'recipe-images');

function extFromUri(uri: string) {
  const m = uri.toLowerCase().match(/\.(png|jpg|jpeg|webp|heic|heif)$/);
  if (m?.[1] === 'jpeg') return 'jpg';
  return m?.[1] ?? 'jpg';
}

function safeBaseName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function ensureRecipeImagesDir(): Promise<void> {
  if (Platform.OS === 'web') return;
  IMAGES_DIR.create({ intermediates: true, idempotent: true });
}

/** Copies a picked image into Documents so it survives restarts/cache cleanup. */
export async function persistPickedCoverImage(params: {
  pickedUri: string;
  recipeId: string;
  title: string;
}): Promise<string> {
  if (Platform.OS === 'web') return params.pickedUri;

  await ensureRecipeImagesDir();

  const ext = extFromUri(params.pickedUri);
  // Unique name per save so (1) expo-image disk cache does not show a previous photo at the same URI,
  // (2) we can delete the prior file when replacing a cover.
  const name = `${safeBaseName(params.title || 'recipe') || 'recipe'}_${params.recipeId}_${Date.now()}.${ext}`;
  // Use `new File(dir, name)` instead of `dir.createFile(...)`: the latter calls `super.createFile`
  // and can throw "_superPropGet ... is not a function" when the native class binding is incomplete.
  const dest = new File(IMAGES_DIR, name);
  dest.create({ overwrite: true });

  // We prefer byte copy so it works for both file:// and content:// sources.
  const src = new File(params.pickedUri);
  const bytes = await src.bytes();
  dest.write(bytes);

  return dest.uri;
}

export async function writeCoverFromBase64(params: { base64: string; fileName: string }): Promise<string> {
  if (Platform.OS === 'web') throw new Error('Cover import is not supported on web');
  await ensureRecipeImagesDir();
  const dest = new File(IMAGES_DIR, params.fileName);
  dest.create({ overwrite: true });
  // `File.write` on native expects a single argument; `{ encoding: 'base64' }` as a second arg fails on iOS.
  dest.write(base64ToBytes(params.base64));
  return dest.uri;
}

export function isAppManagedRecipeImage(uri?: string) {
  if (!uri) return false;
  return uri.startsWith(IMAGES_DIR.uri);
}

/** Removes a file under Documents/recipe-images/ (no-op if not ours or missing). */
export function deleteStoredRecipeCover(uri: string | undefined): void {
  if (Platform.OS === 'web' || !uri?.trim()) return;
  if (!isAppManagedRecipeImage(uri)) return;
  try {
    const f = new File(uri);
    if (f.exists) {
      f.delete();
    }
  } catch {
    // ignore missing / permission
  }
}

