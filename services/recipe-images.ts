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
  const name = `${safeBaseName(params.title || 'recipe') || 'recipe'}_${params.recipeId}.${ext}`;
  const dest = IMAGES_DIR.createFile(name, `image/${ext === 'jpg' ? 'jpeg' : ext}`);
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
  const dest = IMAGES_DIR.createFile(params.fileName, 'application/octet-stream');
  dest.create({ overwrite: true });
  dest.write(params.base64, { encoding: 'base64' });
  return dest.uri;
}

export function isAppManagedRecipeImage(uri?: string) {
  if (!uri) return false;
  return uri.startsWith(IMAGES_DIR.uri);
}

