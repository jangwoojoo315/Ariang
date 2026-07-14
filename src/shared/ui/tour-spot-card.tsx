'use client';
import { PlaceholderImg } from './placeholder-img';
import { IcoStroller, IcoCar, IcoAccessible } from './icons';
import { REGION_LABELS } from '@/shared/api/region-labels';
import type { TourSpot, RecentPlace } from '@/shared/api/generated/model';

interface Props {
  item: TourSpot | RecentPlace;
  rank?: number;
  fill?: boolean;
  onClick?: (item: TourSpot | RecentPlace) => void;
}

export function TourSpotCard({ item, rank, fill, onClick }: Props) {
  const badges = [
    { key: 'stroller', label: '유아차 대여', Icon: IcoStroller, ok: item.isStrollerRental },
    { key: 'parking', label: '주차', Icon: IcoCar, ok: item.isPark },
    { key: 'toilet', label: '화장실', Icon: IcoAccessible, ok: item.isToilet },
  ];

  return (
    <div
      onClick={() => onClick?.(item)}
      style={{
        width: fill ? '100%' : 195, borderRadius: 16, background: 'var(--surface)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden', flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)';
      }}
    >
      <div style={{ position: 'relative' }}>
        <PlaceholderImg img={item.imgUrl ?? undefined} height={118} />
        {rank && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>
            #{rank}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
          {REGION_LABELS[item.region] ?? item.region}
          {item.price ? ` · ${item.price}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {badges.map((b) => (
            <div key={b.key} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20,
              background: b.ok ? 'var(--tag-bg)' : '#F2F2F2',
              color: b.ok ? 'var(--primary)' : '#C0C0C0',
              fontSize: 10, fontWeight: 600,
              border: `1px solid ${b.ok ? 'var(--border)' : '#EBEBEB'}`,
            }}>
              <b.Icon size={10} color={b.ok ? 'var(--primary)' : '#C0C0C0'} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
