'use client';
import { useState, useEffect } from 'react';

interface Props { children: React.ReactNode; onClose: () => void; }

export function BottomSheet({ children, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);
  const close = () => { setVisible(false); setTimeout(onClose, 300); };
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:200, background: visible ? 'rgba(0,0,0,0.45)' : 'transparent', transition:'background 0.3s' }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:'absolute', bottom:0, left:0, right:0,
          background:'var(--surface)', borderRadius:'22px 22px 0 0',
          maxHeight:'92vh', overflowY:'auto',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
          paddingBottom:28,
        }}
      >
        {children}
      </div>
    </div>
  );
}
