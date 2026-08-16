'use client';

import { useEffect, useState } from 'react';

// 목 활성화 조건: NEXT_PUBLIC_API_MOCKING=enabled 일 때만.
// 내 여행(MyTour) API만 목으로 가로채고, 나머지(홈·검색)는 실서버로 통과된다.
const mockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // 목이 켜져 있으면 워커가 준비될 때까지 렌더를 미뤄 요청 레이스를 막는다.
  const [ready, setReady] = useState(!mockingEnabled);

  useEffect(() => {
    if (!mockingEnabled) return;

    let active = true;
    import('@/shared/api/mocks/browser')
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { url: '/mockServiceWorker.js' },
        }),
      )
      .then(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
