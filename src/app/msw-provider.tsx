'use client';

import { useEffect, useState } from 'react';

// 목 활성화 조건: NEXT_PUBLIC_API_MOCKING=enabled 일 때만.
// 실제 백엔드를 연결하면 이 플래그를 끄고(제거), 없으면 실서버로 요청이 나간다.
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
