import { Platform } from 'react-native';

/** Shared spacing for card-block UI (compact, modern). */
export const UI = {
  screenPadding: 14,
  cardRadius: 20,
  heroCardRadius: 24,
  cardGap: 12,
  listImageHeight: 104,
  searchRadius: 16,
} as const;

/** Soft shadow for floating hero card (iOS + Android). */
export const heroCardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  android: { elevation: 6 },
  default: {},
});
