'use client';

interface Props { title: string; onMore?: () => void; }

export function SectionHeader({ title, onMore }: Props) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, paddingRight:4 }}>
      <div style={{ fontWeight:700, fontSize:17 }}>{title}</div>
      {onMore && (
        <button onClick={onMore} style={{ color:'var(--primary)', fontSize:13, fontWeight:500, padding:'4px 2px' }}>전체보기 →</button>
      )}
    </div>
  );
}
