# FSD (Feature-Sliced Design) 구조 가이드라인

이 프로젝트는 **Next.js App Router + FSD 아키텍처**를 사용합니다.
개발 요청을 받으면 반드시 아래 규칙에 따라 파일을 올바른 레이어에 배치하세요.

---

## 레이어 구조 (상위 → 하위 의존성 방향)

```
src/
├── app/          # Next.js App Router 전용 (라우팅, 레이아웃, 프로바이더)
├── views/        # FSD pages 레이어 역할 (페이지 단위 조합)
├── widgets/      # 독립적인 복합 UI 블록
├── features/     # 사용자 시나리오, 비즈니스 액션
├── entities/     # 비즈니스 엔티티 (도메인 모델)
└── shared/       # 재사용 가능한 범용 코드
    ├── api/
    ├── config/
    ├── lib/
    ├── types/
    └── ui/
```

---

## 각 레이어 규칙

### `app/` — Next.js 전용
- `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` 등 Next.js 파일 컨벤션만 위치
- 전역 Provider, 전역 CSS 포함
- **FSD 레이어가 아님** — Next.js App Router의 요구사항에 따른 폴더
- `app/page.tsx`는 단순히 `views/`의 컴포넌트를 import해서 렌더링만 함

### `views/` — FSD pages 레이어 (⚠️ Next.js `pages/` 예약어 대체)
- 페이지 단위의 UI 조합 컴포넌트
- `widgets`, `features`, `entities`를 조합해 하나의 화면을 구성
- 예: `views/home/`, `views/profile/`, `views/song-detail/`
- **하위 레이어(`widgets` 이하)만 import 가능**

### `widgets/` — 복합 UI 블록
- 여러 `features`나 `entities`를 조합한 독립적 UI 단위
- 특정 페이지에 종속되지 않고 재사용 가능해야 함
- 예: `widgets/header/`, `widgets/player/`, `widgets/song-card/`

### `features/` — 사용자 액션 / 비즈니스 기능
- 사용자가 수행하는 단일 액션 또는 시나리오
- 예: `features/auth/`, `features/like-song/`, `features/search/`
- `entities`, `shared`만 import 가능

### `entities/` — 도메인 엔티티
- 비즈니스 도메인의 핵심 모델과 관련 UI
- 예: `entities/song/`, `entities/user/`, `entities/playlist/`
- `shared`만 import 가능

### `shared/` — 범용 유틸리티
- 도메인 지식 없는 순수 유틸, UI 컴포넌트, 타입, 설정
- 어떤 레이어도 import 가능 (단, 상위 레이어 import 불가)
- `shared/ui/` — Button, Input 등 기본 UI 컴포넌트
- `shared/lib/` — 유틸 함수
- `shared/api/` — API 클라이언트, fetcher
- `shared/config/` — 환경변수, 앱 설정
- `shared/types/` — 공통 타입

---

## 핵심 규칙

1. **단방향 의존성**: 상위 레이어는 하위 레이어만 import 가능
   - `views` → `widgets` → `features` → `entities` → `shared`
   - 같은 레이어 간 import 금지 (단, `shared`는 예외 없음)

2. **Public API**: 각 슬라이스 루트에만 `index.ts`를 두고 외부에 노출할 것만 export
   - 슬라이스 내부 세그먼트(`ui/`, `model/`, `api/`)에는 `index.ts` 작성 금지
   - 슬라이스 외부에서는 항상 루트 `index.ts`를 통해 import
   - 슬라이스 내부에서는 세그먼트 파일을 직접 경로로 import

3. **`app/page.tsx` 패턴**:
   ```tsx
   // src/app/some-route/page.tsx
   import { SomePage } from '@/views/some-page';
   export default function Page() { return <SomePage />; }
   ```

4. **슬라이스 구조**: 각 슬라이스 내부는 세그먼트로 구성
   ```
   features/like-song/
   ├── ui/
   │   └── LikeButton.tsx      # 직접 파일 참조, index.ts 없음
   ├── model/
   │   └── useLikeSong.ts      # 직접 파일 참조, index.ts 없음
   ├── api/
   │   └── likeSongApi.ts      # 직접 파일 참조, index.ts 없음
   └── index.ts                # 슬라이스 루트에만 Public API 존재
   ```
   ```ts
   // 슬라이스 외부 → 루트 index.ts 사용
   import { LikeButton } from '@/features/like-song';

   // 슬라이스 내부 → 직접 경로 사용
   import { likeSongApi } from './api/likeSongApi';
   ```

---

## 파일 배치 판단 기준

| 상황 | 위치 |
|------|------|
| Next.js 라우트/레이아웃 파일 | `app/` |
| 화면 전체를 구성하는 컴포넌트 | `views/` |
| 여러 곳에서 쓰이는 복합 UI 블록 | `widgets/` |
| 사용자가 "~한다" 로 표현되는 기능 | `features/` |
| 도메인 모델 (노래, 유저, 플레이리스트) | `entities/` |
| 버튼, 유틸, API 클라이언트 등 범용 | `shared/` |
