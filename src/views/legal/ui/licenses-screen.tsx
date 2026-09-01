'use client';
import { useRouter } from 'next/navigation';
import licenses from '../licenses.generated.json';

// 라이선스 데이터는 license-checker로 자동 생성한다.
// 패키지를 추가·제거하면 `pnpm licenses:generate`로 갱신할 것.
type Pkg = {
  name: string;
  version: string;
  license: string;
  repository: string;
  licenseText: string;
};

const PACKAGES = licenses as Pkg[];

export function LicensesScreen() {
  const router = useRouter();
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }} className="no-scroll">
      {/* 상단바 (뒤로가기) */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px' }}>
        <button onClick={() => router.back()} aria-label="뒤로가기" style={{ border: 'none', background: 'transparent', fontSize: 20, lineHeight: 1, cursor: 'pointer', color: 'var(--text)', padding: 4 }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 18 }}>오픈소스 라이선스</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
          아이랑은 아래 {PACKAGES.length}개의 오픈소스 소프트웨어를 사용하여 만들어졌습니다. 각 소프트웨어의 권리는 원저작자에게 있으며, 항목을 누르면 라이선스 전문을 볼 수 있습니다.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PACKAGES.map((p) => (
            <details key={p.name} style={{ background: 'var(--surface)', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, wordBreak: 'break-all' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>v{p.version} · {p.license}</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text2)', flexShrink: 0 }}>›</span>
              </summary>
              <div style={{ padding: '0 16px 16px' }}>
                {p.repository && (
                  <a href={p.repository} target="_blank" rel="noreferrer noopener" style={{ fontSize: 12, color: 'var(--primary)', wordBreak: 'break-all' }}>
                    {p.repository}
                  </a>
                )}
                {p.licenseText && (
                  <pre style={{ marginTop: 10, marginBottom: 0, background: 'var(--bg)', borderRadius: 12, padding: 14, fontSize: 11, lineHeight: 1.7, color: 'var(--text2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {p.licenseText}
                  </pre>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
