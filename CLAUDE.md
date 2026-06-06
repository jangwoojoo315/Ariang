@AGENTS.md

# 개발 규칙

이 프로젝트는 **Next.js App Router + FSD(Feature-Sliced Design)** 아키텍처를 사용합니다.
코드를 작성하거나 파일을 생성할 때 반드시 FSD 구조 가이드라인을 따르세요.

자세한 FSD 규칙은 `/fsd` 커맨드 또는 `.claude/commands/fsd.md`를 참조하세요.

## 핵심 주의사항
- `pages/` 폴더는 사용하지 않습니다. Next.js 예약어이므로 FSD의 pages 레이어는 `views/`로 대체합니다.
- `app/` 폴더는 Next.js 라우팅 전용이며, 실제 UI 조합은 `views/`에서 합니다.
- 상위 레이어가 하위 레이어를 import하는 단방향 의존성을 반드시 지킵니다.
