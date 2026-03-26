export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  imageUri?: string;
  isFavorite: boolean;
  createdAt: number;
};
