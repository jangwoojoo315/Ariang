# 설정 알림 토글이 즉시 반응하지 않는 문제 (Optimistic UI → 로컬 state)

- **작성일**: 2026-08-19
- **영역**: 설정 페이지 / React Query / 토글 UX
- **분류**: 상태관리 / 사용자 경험

## 문제 (Problem)

설정 페이지의 알림 토글(스위치)을 눌러도 **바로 움직이지 않고 지연**이 있었다.
스위치가 네트워크 왕복을 기다렸다가 움직이니 "안 눌리나?" 싶은 느낌.

## 원인 (Cause)

토글의 `active` 값이 **서버 데이터(React Query 캐시)에 직접 바인딩**돼 있었다.

```tsx
// (문제) 서버 값에 묶임 → 응답+refetch가 끝나야 토글이 반영됨(비관적)
<Toggle active={!!userInfo?.[key]}
        onChange={() => { await updateAlarmSetting(...); invalidate(); }} />
```

1단계로 **낙관적 업데이트**(`queryClient.setQueryData`로 캐시 즉시 변경)를 적용했지만
여전히 미세한 지연이 있었다. React Query는 `notifyManager`로 구독자 알림을 배치/스케줄링하므로,
`setQueryData` → 리렌더 사이에 한 틱의 지연이 생겨 **완전한 즉시 반응은 아니었다.**

## 해결 (Solution)

토글 표시값을 **로컬 state로 분리**해, 클릭 시 동기적으로 즉시 바꾸고 API는 백그라운드로 보냈다.
서버 값이 바뀌면 렌더 단계에서 로컬 state를 맞춘다(effect 없이 — React 권장 "prop 변경 시 state 조정" 패턴).

```tsx
const [alarm, setAlarm] = useState({ dayBeforeTodoEnabled: false, dayAlarmEnabled: false });
const [syncedFrom, setSyncedFrom] = useState<UserInfo | undefined>(undefined);
if (userInfo && userInfo !== syncedFrom) {          // 렌더 중 동기화 (effect 아님)
  setSyncedFrom(userInfo);
  setAlarm({ dayBeforeTodoEnabled: userInfo.dayBeforeTodoEnabled,
             dayAlarmEnabled: userInfo.dayAlarmEnabled });
}

const toggleAlarm = async (field, value) => {
  setAlarm((a) => ({ ...a, [field]: value }));       // ① 즉시 반영(동기)
  try {
    await updateAlarmSetting({ [field]: value });     // ② 백그라운드 요청
    // 성공 시 invalidate 생략 — 보낸 값이 곧 최신
  } catch {
    setAlarm((a) => ({ ...a, [field]: !value }));      // ③ 실패 시 롤백
  }
};
```

## 적용 전 / 후 (Before / After)

| 구분 | 전(비관적) | 중간(낙관적/캐시) | 후(로컬 state) |
|---|---|---|---|
| 클릭 즉시 | 안 움직임 | 거의 즉시(한 틱 지연) | **완전 즉시** |
| 소스 | 서버 캐시 | 서버 캐시(낙관적) | 로컬 state |
| 성공 후 | refetch | (선택) | 재조회 없음 |
| 실패 | — | 롤백 | 롤백 |

## 배운 점 (Takeaways)

- **토글/스위치는 낙관적 UI의 대표 케이스** — 성공률 높고, 실패 롤백이 싸고, 즉시 피드백을 기대한다.
- 낙관적 업데이트라도 **서버 상태 캐시에 바인딩**하면 캐시 알림 타이밍만큼 지연이 남는다.
  "무조건 즉시" 애니메이션이 필요하면 **로컬 state로 UI를 디커플링**하는 게 확실하다.
- 서버→로컬 동기화는 effect보다 **렌더 단계의 조건부 setState**가 깔끔하다(불필요한 리렌더/깜빡임 감소).
- 낙관적 성공 시 매번 `invalidate()`(재조회)는 낭비 — 보낸 값을 신뢰하고 생략 가능.
