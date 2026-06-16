'use client';
import { PlaceholderImg } from './placeholder-img';
import { ThemeChip } from './theme-chip';
import { AccessBadges } from './access-badges';
import { IcoSpark } from './icons';
import type { SpotOrFestival } from '@/shared/types';

interface Props {
  item: SpotOrFestival;
  onClick: (item: SpotOrFestival) => void;
  showRank?: boolean;
  fill?: boolean;
}

export function SpotCard({ item, onClick, showRank, fill }: Props) {
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        width: fill ? '100%' : 195, borderRadius:16, background:'var(--surface)',
        boxShadow:'0 2px 10px rgba(0,0,0,0.07)', cursor:'pointer',
        overflow:'hidden', flexShrink:0,
        transition:'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.13)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ position:'relative' }}>
        <PlaceholderImg theme={item.theme} img={item.img} height={118} />
        {showRank && item.rank && (
          <div style={{ position:'absolute', top:8, left:8, background:'var(--accent)', color:'#fff', borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:800 }}>
            #{item.rank}
          </div>
        )}
        {item.isNew && (
          <div style={{ position:'absolute', top:8, right:8, background:'var(--primary)', color:'#fff', borderRadius:10, padding:'2px 8px', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
            NEW <IcoSpark size={10} color="#fff" />
          </div>
        )}
      </div>
      <div style={{ padding:'10px 12px 12px' }}>
        <ThemeChip theme={item.theme} small />
        <div style={{ fontWeight:700, fontSize:14, marginTop:5, marginBottom:2, lineHeight:1.35, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize:11, color:'var(--text2)', marginBottom:6 }}>
          {item.region}{'dateRange' in item && item.dateRange ? ` · ${item.dateRange}` : ''}
        </div>
        <div style={{ marginTop:8 }}>
          <AccessBadges item={item} compact />
        </div>
      </div>
    </div>
  );
}
