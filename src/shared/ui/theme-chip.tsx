'use client';
import { THEMES } from '@/entities/spot';
import { THEME_ICONS } from './icons';
import type { Theme } from '@/shared/types';

interface Props { theme: Theme; small?: boolean; }

export function ThemeChip({ theme, small }: Props) {
  const t = THEMES[theme];
  if (!t) return null;
  const Icon = THEME_ICONS[theme];
  return (
    <span style={{
      background: t.bg, color: t.color,
      fontSize: small ? 10 : 11, fontWeight: 700,
      padding: small ? '2px 7px' : '3px 9px',
      borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Icon size={small ? 10 : 11} color={t.color} />
      <span>{t.label}</span>
    </span>
  );
}
