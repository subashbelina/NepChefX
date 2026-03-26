import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { AddRecipeBlock } from '@/features/recipes/components/add-recipe-block';
import { CoverPhotoPlaceholder } from '@/features/recipes/components/cover-photo-placeholder';
import { UI } from '@/constants/ui-layout';

export function AddRecipeCoverBlock({
  imageUri,
  onPickImage,
}: {
  imageUri: string | undefined;
  onPickImage: () => void;
}) {
  return (
    <AddRecipeBlock title="Cover photo" subtitle="Optional — appears on your recipe card in the list.">
      {imageUri ? (
        <>
          <View style={[styles.photoClip, { borderRadius: UI.cardRadius - 4 }]}>
            <Image source={{ uri: imageUri }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" transition={0} />
          </View>
          <Button mode="contained-tonal" onPress={onPickImage} icon="image" compact style={styles.photoBtn}>
            Change photo
          </Button>
        </>
      ) : (
        <CoverPhotoPlaceholder onPress={onPickImage} />
      )}
    </AddRecipeBlock>
  );
}

const styles = StyleSheet.create({
  photoClip: {
    height: 132,
    width: '100%',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoBtn: { alignSelf: 'flex-start' },
});

