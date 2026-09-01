import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

// docs/legal/*.md 를 단일 소스로 읽어 앱에서 렌더링할 HTML로 변환한다.
// - 개발자 검토용 경고(blockquote)와 최상단 제목(H1)은 제거한다.
//   (제목은 화면 상단바에서 별도로 보여주고, 경고는 이용자에게 노출하지 않음)
export function readLegalDoc(file: string): string {
  const md = readFileSync(join(process.cwd(), 'docs/legal', file), 'utf8');
  const cleaned = md
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('>') && !line.startsWith('# '))
    .join('\n');
  return marked.parse(cleaned, { async: false });
}
