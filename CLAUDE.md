@AGENTS.md

# 개발 규칙

이 프로젝트는 **Next.js App Router + FSD(Feature-Sliced Design)** 아키텍처를 사용합니다.
코드를 작성하거나 파일을 생성할 때 반드시 FSD 구조 가이드라인을 따르세요.

자세한 FSD 규칙은 `/fsd` 커맨드 또는 `.claude/commands/fsd.md`를 참조하세요.

## Git 사용 제한
- **사용자의 명시적 허락 없이는 어떠한 git 명령어도 실행하지 않습니다.**
- `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout` 등 모든 git 작업은 사용자가 직접 요청하거나 승인한 경우에만 실행합니다.
- `git status`, `git log`, `git diff` 같은 읽기 전용 명령어도 사용자의 명시적 요청이 있을 때만 실행합니다.

## 핵심 주의사항
- `pages/` 폴더는 사용하지 않습니다. Next.js 예약어이므로 FSD의 pages 레이어는 `views/`로 대체합니다.
- `app/` 폴더는 Next.js 라우팅 전용이며, 실제 UI 조합은 `views/`에서 합니다.
- 상위 레이어가 하위 레이어를 import하는 단방향 의존성을 반드시 지킵니다.
