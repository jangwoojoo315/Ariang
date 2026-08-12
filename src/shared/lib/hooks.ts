'use client';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { isAuthenticated, subscribeAuth } from './auth';

export function useWindowWidth() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    window.dispatchEvent(new Event('resize'));
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// localStorage 토큰을 외부 스토어로 구독해 로그인 여부를 반환한다.
// 서버 스냅샷은 false → 하이드레이션 불일치 없이 클라이언트에서 갱신되고,
// 로그인/로그아웃 시 auth-change 이벤트로 자동 반영된다.
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribeAuth,
    () => isAuthenticated(),
    () => false,
  );
}
