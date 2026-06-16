'use client';

interface Props { children: React.ReactNode; onClose: () => void; }

export function Modal({ children, onClose }: Props) {
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'var(--surface)', borderRadius:22, padding:'24px 22px', width:'100%', maxWidth:380, boxShadow:'0 24px 64px rgba(0,0,0,0.2)', animation:'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {children}
      </div>
    </div>
  );
}
