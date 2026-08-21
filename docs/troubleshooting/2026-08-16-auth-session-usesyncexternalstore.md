# 로그인 세션 복원과 SSR 하이드레이션 불일치 (useSyncExternalStore)

- **작성일**: 2026-08-16
- **영역**: 인증 세션 / Next.js SSR / 외부 스토어 구독
- **분류**: 상태관리 / 하이드레이션

## 문제 (Problem)

새로고침해도 로그인 상태가 유지돼야 하고(localStorage 토큰 기반), 로그인/로그아웃 시
게이트(내 여행·설정) 화면이 자동 전환돼야 했다. 초기 구현은 `useEffect`에서
`setState`로 로그인 여부를 넣었는데:

- 린트가 **"effect에서 동기 setState"** 를 경고(불필요한 리렌더 유발)
- SSR에서는 `localStorage`가 없어 초기값을 잘못 잡으면 **하이드레이션 불일치** 위험

## 원인 (Cause)

로그인 여부는 사실 **localStorage라는 "외부 스토어"의 상태**다.
이를 컴포넌트 지역 state + effect로 흉내 내면:
- 서버 스냅샷/클라이언트 스냅샷이 어긋나 hydration mismatch가 날 수 있고,
- 같은 탭 내 변경(로그아웃)·다른 탭 변경을 반영하기 어렵다.

## 해결 (Solution)

React 18의 **`useSyncExternalStore`** 로 localStorage를 외부 스토어처럼 구독했다.
- `getServerSnapshot`은 `false`(비로그인) → **하이드레이션 불일치 없음**, 클라이언트에서 실제 값으로 갱신
- 토큰 변경 시 커스텀 `auth-change` 이벤트(같은 탭) + `storage` 이벤트(다른 탭)로 구독자에게 통지

```ts
// shared/lib/auth.ts
const AUTH_CHANGE_EVENT = 'auth-change';
export function setTokens(access, refresh?) {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT)); // 같은 탭 통지
}
export function subscribeAuth(cb) {
  window.addEventListener(AUTH_CHANGE_EVENT, cb);
  window.addEventListener('storage', cb); // 다른 탭 통지
  return () => { /* removeEventListener ... */ };
}

// shared/lib/hooks.ts
export function useIsAuthenticated() {
  return useSyncExternalStore(
    subscribeAuth,
    () => isAuthenticated(),  // 클라이언트 스냅샷
    () => false,              // 서버 스냅샷 → mismatch 방지
  );
}
```

## 적용 전 / 후 (Before / After)

| 구분 | 전(useEffect+setState) | 후(useSyncExternalStore) |
|---|---|---|
| 하이드레이션 | 초기값 오설정 시 불일치 위험 | 서버=false로 일관, 안전 |
| 린트 | effect 내 setState 경고 | 해당 없음 |
| 같은 탭 반영 | 수동 처리 필요 | auth-change 이벤트로 자동 |
| 다른 탭 반영 | 어려움 | storage 이벤트로 자동 |

## 배운 점 (Takeaways)

- **localStorage/쿠키 같은 브라우저 외부 상태는 `useSyncExternalStore`가 정석.**
  effect+state로 흉내 내면 하이드레이션·타이밍 문제가 생긴다.
- 브라우저 `storage` 이벤트는 **다른 탭에서만** 발생 → 같은 탭 즉시 반영은 커스텀 이벤트가 필요.
- 클라이언트 전용 값은 **서버 스냅샷을 보수적으로(false 등)** 잡아 hydration mismatch를 원천 차단한다.
