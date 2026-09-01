'use client';
import { useRouter } from 'next/navigation';

// 개인정보 처리방침·이용약관 등 마크다운 기반 문서를 보여주는 공용 화면.
// 내용(html)은 서버에서 docs/legal/*.md 를 변환해 전달받는다.
export function LegalDocScreen({ title, html }: { title: string; html: string }) {
  const router = useRouter();
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }} className="no-scroll">
      {/* 상단바 (뒤로가기) */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px' }}>
        <button onClick={() => router.back()} aria-label="뒤로가기" style={{ border: 'none', background: 'transparent', fontSize: 20, lineHeight: 1, cursor: 'pointer', color: 'var(--text)', padding: 4 }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 18 }}>{title}</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 48px' }}>
        <div className="legal-doc" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
