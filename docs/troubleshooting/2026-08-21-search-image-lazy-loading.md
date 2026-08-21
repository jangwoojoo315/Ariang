# 탐색 페이지 이미지 로딩 성능 개선 (레이지 로딩)

- **작성일**: 2026-08-21
- **영역**: 탐색 페이지 / 공용 이미지 컴포넌트(`PlaceholderImg`)
- **분류**: 성능 / 렌더링 최적화

## 문제 (Problem)

탐색 페이지에서 검색 결과가 많을 때 **초기 로딩이 눈에 띄게 느렸다.**

- 검색 결과 카드(관광지)가 수십~수백 개 렌더링됨
- 각 카드가 여행지 **이미지를 전부 로드**하면서 네트워크가 몰림
- 화면에 보이지도 않는 아래쪽 카드의 이미지까지 미리 받아 초기 표시가 지연

## 원인 (Cause)

카드 이미지는 공용 컴포넌트 `PlaceholderImg`가 `next/image`로 렌더링한다.
`next/image`는 기본적으로 네이티브 lazy loading(`loading="lazy"`)을 적용하지만,
**브라우저 네이티브 lazy는 뷰포트보다 훨씬 앞선 지점(수백~1000px 이상)에서 미리 로드**한다.
그래서 긴 그리드에서는 사실상 대부분의 이미지를 한꺼번에 받는 것처럼 동작해
"보이는 것만 먼저"가 되지 않았다.

> 데이터는 페이지네이션 미지원이라 한 번에 다 받는 구조. 이번 개선 범위는 **이미지 로딩**에 한정.

## 해결 (Solution)

`PlaceholderImg`에 **`IntersectionObserver` 기반 레이지 로딩 게이트**를 추가했다.

- 카드가 **뷰포트 근처(rootMargin `200px`)에 들어올 때만** 실제 이미지를 로드
- 그전까지는 **가벼운 그라데이션 SVG 플레이스홀더**만 표시 (이미지 네트워크 요청 없음)
- 이미지 로드 중에도 플레이스홀더가 배경에 깔려 있어 레이아웃 시프트/깜빡임 없음
- 로드 실패 시 플레이스홀더로 폴백

`PlaceholderImg`는 탐색·내 여행·상세·홈 카드가 공유하므로 **한 곳 수정으로 전역 적용**됐다.

### 핵심 코드 (`src/shared/ui/placeholder-img.tsx`)

```tsx
const [inView, setInView] = useState(false);
const ref = useRef<HTMLDivElement>(null);

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
    { rootMargin: '200px' }, // 뷰포트 200px 앞에서 미리 로드 시작
  );
  io.observe(el);
  return () => io.disconnect();
}, [img, inView]);

// 뷰포트 근처에 들어왔을 때만 실제 이미지 렌더
{img && !err && inView && (
  <Image src={img} alt="" fill style={{ objectFit: 'cover' }} unoptimized onError={() => setErr(true)} />
)}
```

## 적용 전 / 후 (Before / After)

| 구분 | 적용 전 | 적용 후 |
|---|---|---|
| 이미지 로드 대상 | 결과 전체(화면 밖 포함) 사실상 한꺼번에 | **뷰포트 + 200px 안**의 카드만 |
| 초기 네트워크 | 이미지 요청 폭주 | 보이는 약 20개 내외만 |
| 화면 밖 카드 | 실제 이미지 로드 | 그라데이션 플레이스홀더만 |
| 스크롤 시 | 이미 다 받음 | 내려가면 순차 로드 |
| 로딩 체감 | 느림 | **뚜렷하게 개선** |

## 결과 (Result)

- 초기 진입 시 실제로 보이는 카드 이미지만 로드 → **체감 속도가 크게 개선**됨
- 스크롤에 따라 아래 이미지가 자연스럽게 이어서 로드
- 공용 컴포넌트 수정이라 탐색뿐 아니라 이미지가 많은 다른 화면도 함께 개선

## 남은 개선 여지 (Follow-up)

- **데이터 레벨 최적화**는 미적용: 여전히 검색 결과를 한 번에 다 받는다.
  백엔드가 페이지네이션을 지원하면 **무한 스크롤(`useInfiniteQuery`)**로 데이터도 나눠 받는 것이 다음 단계.
- 목록이 매우 길어져 DOM 노드 수 자체가 병목이 되면 **리스트 가상화(virtualization)** 검토.

## 참고 용어

- **레이지 로딩(Lazy Loading)**: 필요 시점(뷰포트 진입)까지 리소스 로드를 미루는 기법. 이번 적용분.
- **페이지네이션 / 무한 스크롤**: 데이터를 나눠 받는 기법(데이터 최적화).
- **가상화(Virtualization)**: 화면에 보이는 것만 DOM에 렌더하는 기법(렌더 최적화).
