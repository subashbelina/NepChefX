/** Cyan accent border (logo “X” / secondary) for floating cards — light & dark. */
export function brandCyanBorder(isDark: boolean): string {
  return isDark ? 'rgba(93, 213, 232, 0.35)' : 'rgba(0, 172, 193, 0.28)';
}

/** Warm orange border (hat / primary) — pairs with cyan accents on the same screen. */
export function brandOrangeBorder(isDark: boolean): string {
  return isDark ? 'rgba(255, 182, 135, 0.42)' : 'rgba(230, 81, 0, 0.32)';
}

/** Hairline on solid `primary` pills (export, AI save, badges) — light only. */
export function brandPrimaryPillHairline(isDark: boolean): string {
  return isDark ? 'transparent' : 'rgba(191, 54, 12, 0.42)';
}

/** Hairline on cyan `secondaryContainer` pills (Favorites import, etc.) — light only. */
export function brandSecondaryPillHairline(isDark: boolean): string {
  return isDark ? 'transparent' : 'rgba(0, 172, 193, 0.22)';
}
