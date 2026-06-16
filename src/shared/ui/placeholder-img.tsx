'use client';
import { useState, useId } from 'react';
import Image from 'next/image';
import type { Theme } from '@/shared/types';

interface Props {
  theme?: Theme;
  img?: string;
  height?: number;
  style?: React.CSSProperties;
}

const PALETTES: Record<string, [string, string]> = {
  forest:    ['#3A6B47','#7AB87A'],
  wetland:   ['#3A6B7C','#7AB8C4'],
  ocean:     ['#2B5F9E','#5CACDC'],
  farm:      ['#8B6914','#D4A82A'],
  wildlife:  ['#6B4226','#B07850'],
  astronomy: ['#1A1A4E','#5A5AAA'],
  geology:   ['#5B4B2E','#9A8060'],
};

export function PlaceholderImg({ theme = 'forest', img, height = 200, style = {} }: Props) {
  const [err, setErr] = useState(false);
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const [c1, c2] = PALETTES[theme] || PALETTES.forest;

  if (img && !err) {
    return (
      <div style={{ position:'relative', width:'100%', height, flexShrink:0, ...style }}>
        <Image
          src={img}
          alt=""
          fill
          style={{ objectFit:'cover' }}
          onError={() => setErr(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <svg width="100%" height={height} style={{ display:'block', flexShrink:0, ...style }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
        </linearGradient>
        <pattern id={`p${id}`} width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="32" fill="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#g${id})`} />
      <rect width="100%" height="100%" fill={`url(#p${id})`} />
    </svg>
  );
}
