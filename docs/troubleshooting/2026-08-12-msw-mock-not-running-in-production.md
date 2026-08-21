# MSW 목이 배포(운영) 환경에서 동작하지 않음

- **작성일**: 2026-08-12
- **영역**: 앱 초기화 / MSW / Next.js 빌드
- **분류**: 환경 구성 / 빌드 타임 상수

## 문제 (Problem)

로컬에서는 홈 화면 데이터가 정상인데, **Vercel 배포본에서는 홈 섹션이 비어 있었다.**
DevTools Network를 보면 `/api/ecotourism` 등 홈 API가 **404**로 실패.

## 원인 (Cause)

MSW 워커를 개발 모드에서만 시작하도록 조건을 걸어둔 것이 원인이었다.

```tsx
// (문제) 개발일 때만 목 시작
if (process.env.NODE_ENV !== 'development') return;
import('@/shared/api/mocks/browser').then(({ worker }) => worker.start(...));
```

Vercel 빌드는 `NODE_ENV === 'production'`이라 **MSW 워커가 아예 시작되지 않았다.**
목이 없으니 `/api/*` 요청이 실제 서버로 나갔고, 백엔드가 없던 시점이라 404.

## 해결 (Solution)

"개발/운영"이 아니라 **명시적 플래그**로 목을 켜도록 바꿨다.
`NEXT_PUBLIC_*` 환경변수는 **빌드 타임에 값이 인라인**되므로, `.env.production`에 넣으면
배포 번들에서도 목을 켤 수 있다.

```tsx
const mockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

// 워커 준비 전에 쿼리가 나가는 레이스를 막기 위해 준비될 때까지 렌더를 지연
const [ready, setReady] = useState(!mockingEnabled);
useEffect(() => {
  if (!mockingEnabled) return;
  import('@/shared/api/mocks/browser')
    .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }))
    .then(() => setReady(true));
}, []);
```

- `.env.production`에 `NEXT_PUBLIC_API_MOCKING=enabled` (공개 플래그, 비밀 아님)
- `.gitignore`의 `.env*`에 `!.env.production` 예외를 추가해 커밋되게 함
- 빌드 산출물에서 상수 폴딩되어 워커 시작 코드가 남는지 확인

## 적용 전 / 후 (Before / After)

| 구분 | 전 | 후 |
|---|---|---|
| 목 활성 조건 | `NODE_ENV === 'development'` | `NEXT_PUBLIC_API_MOCKING === 'enabled'` |
| 운영 배포 | 목 미동작 → API 404 | 플래그로 제어 가능 |
| 실서버 전환 | 코드 수정 필요 | 플래그 제거로 전환 |

## 배운 점 (Takeaways)

- 클라이언트 번들에서 `NODE_ENV`로 개발/운영을 가르면 **배포에서 의도치 않게 코드가 빠질 수 있다.** 동작을 제어할 땐 **명시적 `NEXT_PUBLIC_` 플래그**가 안전.
- `NEXT_PUBLIC_*`는 런타임이 아니라 **빌드 타임에 인라인**된다 → 값 변경 시 재빌드/재배포 필요, dev 서버는 재시작 필요.
- MSW 워커 시작은 비동기이므로, 준비 전에 나가는 요청을 막으려면 **준비 완료까지 렌더를 게이트**하는 게 안전하다.
