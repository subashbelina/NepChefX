/**
 * NepChefX — production brand palette (assets/images/NepChefXlogo.png).
 *
 * **Tab bar (shipped):**
 * - Light dock `#E3ECF5` on app background `#EEF4FA` — clear separation, not white,
 *   works with navy labels/icons (Paper `onSurface` / `onSurfaceVariant`).
 * - Dark dock `#263240` — one step above `#141C26` surface so the dock reads as chrome.
 */
export const Brand = {
  /** Deep navy — primary text / dark surfaces */
  navy: '#1B2F4A',
  navyDeep: '#0F1B2E',
  /** Warm action gradient (hat / energy) */
  orange: '#E65100',
  orangeMid: '#D84315',
  orangeDeep: '#BF360C',
  /** Tech / “X” accent */
  cyan: '#00ACC1',
  cyanBright: '#26C6DA',
  /** Hearts, delete, emphasis */
  red: '#D32F2F',
  redDeep: '#C62828',
  /** Hero card linear gradient stops */
  heroGradient: ['#E65100', '#D84315', '#BF360C'] as const,
  /** Featured carousel fallback / chrome */
  carouselBackdrop: '#152232',
  carouselDotInactive: 'rgba(27, 47, 74, 0.22)',
  /** Slide with no photo: soft cool gradient echoing cyan → navy from the mark */
  carouselNoImageGradient: ['#E8F4F8', '#4FB3C8', '#152232'] as const,
  /** Bottom tab dock — production values (see file header). */
  tabBarDockLight: '#E3ECF5',
  tabBarDockDark: '#263240',
  tabBarDockBorderLight: 'rgba(27, 47, 74, 0.11)',
  tabBarDockBorderDark: 'rgba(230, 235, 242, 0.14)',
  /** Add Recipe → cuisine chips (Nepali, Indian, …) — sage green, not orange / cyan / spice coral. */
  cuisineChipContainer: '#CDE9D6',
  cuisineChipOnContainer: '#0D3D2C',
} as const;
