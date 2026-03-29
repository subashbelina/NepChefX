import type { MD3Theme } from 'react-native-paper';

import { brandOrangeBorder } from '@/constants/brand-chrome';

import type { ChatRole } from './chat-model';

/**
 * NepChefX AI tab — one place for orange-forward chrome + hierarchy.
 * System messages stay neutral; user / assistant carry brand orange hairlines; CTAs use solid primary.
 */

export type AiBubbleChrome = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  elevation: 0 | 1;
};

/** Chat row visuals by role (Paper theme–aware). */
export function aiBubbleChrome(theme: MD3Theme, role: ChatRole): AiBubbleChrome {
  const orangeHairline = brandOrangeBorder(!!theme.dark);
  switch (role) {
    case 'system':
      return {
        backgroundColor: theme.colors.surfaceVariant,
        borderColor: theme.colors.outlineVariant,
        textColor: theme.colors.onSurfaceVariant,
        elevation: 0,
      };
    case 'user':
      return {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: orangeHairline,
        textColor: theme.colors.onPrimaryContainer,
        elevation: 1,
      };
    case 'assistant':
      return {
        backgroundColor: theme.colors.surface,
        borderColor: orangeHairline,
        textColor: theme.colors.onSurface,
        elevation: 1,
      };
  }
}

/** Outlined field inside warm composer strip — idle vs focused. */
export function aiComposerFieldOutline(theme: MD3Theme): { idle: string; focused: string } {
  return {
    idle: theme.dark ? 'rgba(255, 182, 135, 0.38)' : 'rgba(230, 81, 0, 0.3)',
    focused: theme.colors.primary,
  };
}

/** Composer strip behind tools + input (peach / dark orange). */
export function aiComposerStripBackground(theme: MD3Theme): string {
  return theme.colors.primaryContainer;
}

/** Icon tint on composer strip: idle tools use on-primary-container; active use primary. */
export function aiComposerToolIcon(theme: MD3Theme, opts: { active: boolean }): string {
  return opts.active ? theme.colors.primary : theme.colors.onPrimaryContainer;
}
