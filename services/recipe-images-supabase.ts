import { File } from 'expo-file-system';

import { supabase } from '@/services/supabase';

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

/**
 * Uploads a local image (file:// or content://) to Supabase Storage.
 * Returns { bucket, path, publicUrl } you can store on the recipe row.
 *
 * Note: bucket must exist (create it in Supabase dashboard: Storage → New bucket → `recipe-images`).
 */
export async function uploadRecipeImageToSupabase(params: {
  localUri: string;
  recipeId: string;
  fileBaseName?: string;
  bucket?: string;
}): Promise<{ bucket: string; path: string; publicUrl: string }> {
  const bucket = params.bucket ?? 'recipe-images';
  const ext = extFromUri(params.localUri);
  const contentType = contentTypeFromExt(ext);

  // Avoid spaces and keep paths stable.
  const base = (params.fileBaseName ?? 'cover').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const stamp = Date.now();
  const path = `${params.recipeId}/${base || 'cover'}_${stamp}.${ext}`;

  const f = new File(params.localUri);
  const bytes = await f.bytes(); // Uint8Array

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true,
    cacheControl: '3600',
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data.publicUrl;
  if (!publicUrl) throw new Error('Failed to get public URL for uploaded image');

  return { bucket, path, publicUrl };
}

