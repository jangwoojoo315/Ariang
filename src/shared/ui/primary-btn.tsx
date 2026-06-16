'use client';

interface Props {
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function PrimaryBtn({ onClick, children, style = {}, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#D0D0D0' : 'var(--primary)',
        color:'#fff', fontWeight:700, fontSize:15,
        padding:'14px 0', borderRadius:14, width:'100%',
        transition:'background 0.15s, transform 0.1s',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background='var(--primary-light)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background='var(--primary)'; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform='scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform=''; }}
    >
      {children}
    </button>
  );
}
