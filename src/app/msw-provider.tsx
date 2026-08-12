'use client';

import { useEffect, useState } from 'react';

// 목 활성화 조건: 개발 모드이거나, NEXT_PUBLIC_API_MOCKING=enabled 인 경우.
// (실제 백엔드가 없는 배포 환경에서도 MSW로 동작시키기 위함)
const mockingEnabled =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

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
