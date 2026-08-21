# 401 인터셉터의 `/login` 404 및 무한 리다이렉트 루프

- **작성일**: 2026-08-16
- **영역**: axios 인스턴스 / 인증 인터셉터
- **분류**: 인증 / 리다이렉트 처리

## 문제 (Problem)

운영 도메인 루트(`/`)만 쳤는데도 **자동으로 `/login`으로 이동하며 404**가 떴다.
"백엔드가 보낼 리 없는데 왜?" 라는 상황.

## 원인 (Cause)

1. axios 응답 인터셉터가 401을 만나면 refresh를 시도하고, 실패 시
   `window.location.href = '/login'`으로 보냈다. 그런데 이 앱은 SPA라 **`/login` 라우트가 없다** → 404.
2. 실서버 연결로 홈 API가 401을 반환하기 시작하자, **비로그인 사용자가 홈만 봐도** 인터셉터가 발동했다.
3. 리다이렉트 대상을 `/`로 바꾸면 이번엔 **홈 → API 401 → `/` 리다이렉트 → 홈 재로드 → 또 401**
   무한 새로고침 루프 위험이 생긴다.

## 해결 (Solution)

인터셉터가 **로그인 상태(refreshToken 보유)일 때만** 갱신/리다이렉트를 시도하고,
**이미 홈이면 리다이렉트하지 않도록** 가드를 넣었다.

```ts
apiInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

    // 로그인 상태에서 401일 때만 처리 → 비로그인 사용자의 홈 401은 무시(루프 방지)
    if (error.response?.status === 401 && originalRequest && refreshToken) {
      try {
        const { data } = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiInstance(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (window.location.pathname !== '/') window.location.href = '/'; // 이미 홈이면 이동 안 함
      }
    }
    return Promise.reject(error);
  },
);
```

## 적용 전 / 후 (Before / After)

| 구분 | 전 | 후 |
|---|---|---|
| 401 처리 범위 | 모든 401(비로그인 포함) | refreshToken 있을 때만 |
| 리다이렉트 대상 | `/login`(존재 X) → 404 | `/`, 단 이미 홈이면 안 함 |
| 위험 | 강제 이동 / 무한 루프 | 홈은 그대로, 루프 없음 |

## 배운 점 (Takeaways)

- 전역 401 핸들러는 "**로그인 세션이 있는데 만료된 경우**"에만 작동해야 한다.
  공개 화면이 401을 받을 수 있으면, 무조건 로그아웃/리다이렉트는 UX를 깨고 루프를 만든다.
- `window.location.href`로 리다이렉트할 땐 **현재 경로와 목적지가 같은지** 확인해 루프를 차단한다.
- 배포본 동작이 이상하면 먼저 **현재 배포된 코드(HEAD)**를 의심 — 로컬 수정이 아직 배포 안 됐을 수 있다.
