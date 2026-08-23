'use client';
import { useEffect, useState } from 'react';

// 카카오맵 SDK 스크립트를 앱 전체에서 한 번만 로드한다.
let loadPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      reject(new Error('NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다.'));
      return;
    }
    const script = document.createElement('script');
    // autoload=false → 스크립트 로드 후 kakao.maps.load()로 수동 초기화
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

// SDK 준비 여부를 반환. 준비되면 true.
export function useKakaoLoader(): boolean {
  const [ready, setReady] = useState(
    typeof window !== 'undefined' && !!window.kakao?.maps,
  );
  useEffect(() => {
    if (ready) return;
    let active = true;
    loadKakaoSdk()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((e) => {
        console.warn(e);
      });
    return () => {
      active = false;
    };
  }, [ready]);
  return ready;
}
