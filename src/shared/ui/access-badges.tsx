'use client';
import { IcoStroller, IcoMilk, IcoCar, IcoAccessible } from './icons';
import type { SpotOrFestival } from '@/shared/types';

interface Props { item: SpotOrFestival; compact?: boolean; }

export function AccessBadges({ item, compact = false }: Props) {
  const badges = [
    { key:'stroller',   label: compact ? '유아차' : '유아차 가능', Icon: IcoStroller, ok: item.stroller },
    { key:'nursing',    label: compact ? '수유실' : '수유실',       Icon: IcoMilk,     ok: item.nursing },
    { key:'parking',    label: compact ? '주차'   : '주차장',       Icon: IcoCar,      ok: item.parking },
    { key:'accessible', label: compact ? '배려화장실' : '배려 화장실', Icon: IcoAccessible, ok: item.accessible },
  ];
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {badges.map(b => (
        <div key={b.key} style={{
          display:'flex', alignItems:'center', gap:4,
          padding: compact ? '3px 8px' : '4px 9px',
          borderRadius:20,
          background: b.ok ? 'var(--tag-bg)' : '#F2F2F2',
          color: b.ok ? 'var(--primary)' : '#C0C0C0',
          fontSize: compact ? 10 : 11, fontWeight:600,
          border: `1px solid ${b.ok ? 'var(--border)' : '#EBEBEB'}`,
        }}>
          <b.Icon size={compact ? 10 : 12} color={b.ok ? 'var(--primary)' : '#C0C0C0'} />
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
