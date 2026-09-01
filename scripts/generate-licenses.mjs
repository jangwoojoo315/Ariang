// 오픈소스 라이선스 고지 데이터를 자동 생성한다.
// license-checker로 프로덕션 의존성을 조사해
// src/views/legal/licenses.generated.json 에 기록한다.
//
// 실행: pnpm licenses:generate
// 패키지를 추가·제거한 뒤 다시 실행하면 목록이 갱신된다.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const OUT = resolve(root, 'src/views/legal/licenses.generated.json');

// license-checker 실행 (프로덕션 의존성만, JSON 출력)
const raw = execFileSync(
  'pnpm',
  ['exec', 'license-checker', '--production', '--json'],
  { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
);
const data = JSON.parse(raw);

// 자기 자신(앱 패키지)의 이름 → 목록에서 제외
const selfName = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).name;

const packages = Object.entries(data)
  .map(([key, info]) => {
    // key 형식: "name@version" (scoped 패키지는 "@scope/name@version")
    const at = key.lastIndexOf('@');
    const name = key.slice(0, at);
    const version = key.slice(at + 1);
    let licenseText = '';
    if (info.licenseFile) {
      try {
        licenseText = readFileSync(info.licenseFile, 'utf8').trim();
      } catch {
        // 라이선스 원문 파일이 없으면 텍스트 없이 진행
      }
    }
    return {
      name,
      version,
      license: info.licenses ?? 'UNKNOWN',
      repository: info.repository ?? '',
      licenseText,
    };
  })
  .filter((p) => p.name !== selfName)
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(OUT, JSON.stringify(packages, null, 2) + '\n', 'utf8');
console.log(`Wrote ${packages.length} packages → ${OUT}`);
