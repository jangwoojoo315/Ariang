'use client';
import { useState, useId, useRef, useEffect } from 'react';
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
  // 카드가 뷰포트 근처(200px)에 들어오기 전까지 실제 이미지 로드를 미룬다(레이지 로딩).
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const [c1, c2] = PALETTES[theme] || PALETTES.forest;

  useEffect(() => {
    if (!img || inView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [img, inView]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', width: '100%', height, overflow: 'hidden', flexShrink: 0, ...style }}
    >
      {/* 그라데이션 플레이스홀더 (이미지 로드 전/실패 시 배경으로 항상 표시) */}
      <svg
        width="100%"
        height="100%"
        style={{ display: 'block', position: 'absolute', inset: 0 }}
      >
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

      {/* 뷰포트 근처에 들어왔을 때만 실제 이미지를 로드 */}
      {img && !err && inView && (
        <Image
          src={img}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          onError={() => setErr(true)}
          unoptimized
        />
      )}
    </div>
  );
}
