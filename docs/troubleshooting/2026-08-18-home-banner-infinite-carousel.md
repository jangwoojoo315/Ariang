# 홈 배너 무한 자동 캐러셀 (마지막 → 첫 슬라이드 끊김 없이)

- **작성일**: 2026-08-18
- **영역**: 홈 화면 / 캐러셀 UI
- **분류**: 애니메이션 / 렌더링

## 문제 (Problem)

홈 상단 배너에 여행지 3곳을 일정 간격으로 자동 순환시키고 싶었다.
요구사항: **3번째에서 다음으로 넘어가면 1번째가 나와야 한다(무한 순환).**
단순히 `index`를 `2 → 0`으로 되돌리면 트랙이 **역방향으로 확 되감기며** 어색했다.

## 원인 (Cause)

슬라이드를 flex 트랙에 두고 `translateX(-index * 100%)`로 이동시키는 구조에서,
마지막(2)에서 처음(0)으로 index를 바꾸면 `-200% → 0%`로 **거꾸로 애니메이션**된다.
"다음으로 넘어가는" 자연스러운 방향(계속 전진)이 아니다.

## 해결 (Solution)

**클론(clone) + 스냅(snap)** 기법:
- 트랙 끝에 **첫 슬라이드를 하나 더 복제**해 붙인다 → `[0, 1, 2, 0']`
- 정상적으로 `2 → 3(클론)`까지 전진 애니메이션 (계속 전진하는 방향)
- 클론(index === n)에 도달하면 **트랜지션을 끈 채 index를 0으로 스냅** → 눈에 안 보이게 되돌림
- 다음 프레임에 트랜지션을 다시 켜서 순환 지속

```tsx
const extended = [...slides, slides[0]];              // 첫 슬라이드 클론 추가
const [index, setIndex] = useState(0);
const [anim, setAnim] = useState(true);

useEffect(() => {                                     // 자동 전진
  if (slides.length <= 1) return;
  const id = setInterval(() => setIndex((i) => i + 1), 5000);
  return () => clearInterval(id);
}, [slides.length]);

useEffect(() => {                                     // 스냅 후 다음 프레임에 트랜지션 재개
  if (!anim) {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnim(true)));
    return () => cancelAnimationFrame(raf);
  }
}, [anim]);

<div
  onTransitionEnd={() => { if (index === slides.length) { setAnim(false); setIndex(0); } }}
  style={{
    display: 'flex', width: '100%',
    transform: `translateX(-${index * 100}%)`,
    transition: anim ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
  }}
>
  {extended.map((s, i) => <Slide key={i} ... />)}   {/* 각 슬라이드 flex: 0 0 100% */}
</div>
```

핵심 CSS: 트랙 `width:100%` + 각 슬라이드 `flex:0 0 100%` →
`translateX(-index*100%)`가 **컨테이너 폭 단위**로 정확히 한 칸씩 이동한다
(트랜스폼 %는 요소 자기 폭 기준이므로 트랙 폭을 컨테이너와 같게 두는 게 포인트).

## 적용 전 / 후 (Before / After)

| 구분 | 전 | 후 |
|---|---|---|
| 마지막→처음 | `2→0` 역방향 되감기(어색) | 클론까지 전진 후 무음 스냅 |
| 방향 | 되돌아감 | 계속 전진(자연스러움) |
| 데이터 소스 | 하드코딩 배너 | 역사·체험·자연 Top1 3곳 |

## 배운 점 (Takeaways)

- 무한 캐러셀은 **양 끝에 클론을 두고, 경계에서 트랜지션을 끈 채 스냅**하는 게 정석.
- 스냅 직후 트랜지션 재개는 **`requestAnimationFrame` 두 번**(리플로우 보장)으로 안전하게.
- `translateX(%)`는 **자기 자신의 폭 기준** — 트랙/슬라이드 폭 설계를 먼저 맞춰야 한 칸 이동이 정확해진다.
- 슬라이드 개수가 비동기로 늘어날 수 있으면 `key={slides.length}`로 상태를 안전하게 리셋.
