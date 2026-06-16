'use client';
import Image from 'next/image';
import { SpotCard, SectionHeader } from '@/shared/ui';
import { SPOTS, FESTIVALS } from '@/entities/spot';
import { useWindowWidth } from '@/shared/lib';
import type { SpotOrFestival, Bundle } from '@/shared/types';

interface Props {
  onSelectItem: (item: SpotOrFestival) => void;
  onSelectBundle: (bundle: Bundle) => void;
  onAddTrip: (item: SpotOrFestival, date: string) => void;
  savedTrips: { itemId: number }[];
}

interface CardRowProps {
  items: SpotOrFestival[];
  showRank?: boolean;
  isMobile: boolean;
  cardCols: number;
  px: number;
  onSelectItem: (item: SpotOrFestival) => void;
}

function CardRow({ items, showRank, isMobile, cardCols, px, onSelectItem }: CardRowProps) {
  return isMobile ? (
    <div style={{ display:'flex', gap:14, overflowX:'auto', margin:`0 -${px}px`, padding:`0 ${px}px 16px` }} className="no-scroll">
      {items.map(item => <SpotCard key={item.id} item={item} onClick={onSelectItem} showRank={showRank} />)}
    </div>
  ) : (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cardCols}, 1fr)`, gap:18, marginBottom:16 }}>
      {items.map(item => <SpotCard key={item.id} item={item} onClick={onSelectItem} showRank={showRank} fill />)}
    </div>
  );
}

export function HomeScreen({ onSelectItem }: Props) {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isWide = width >= 1200;
  const px = isMobile ? 16 : isWide ? 48 : 32;
  const cardCols = isMobile ? 2 : isWide ? 5 : 3;

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom: isMobile ? 80 : 40 }} className="no-scroll">

      {/* Hero Banner */}
      <div style={{ position:'relative', overflow:'hidden', minHeight: isMobile ? 220 : 340 }}>
        <Image src={SPOTS[0].img} alt="" fill style={{ objectFit:'cover', objectPosition:'center' }} unoptimized />
        <div style={{
          position:'absolute', inset:0,
          background: isMobile
            ? 'linear-gradient(to top, rgba(20,50,30,0.85) 0%, rgba(20,50,30,0.45) 55%, rgba(20,50,30,0.15) 100%)'
            : 'linear-gradient(to right, rgba(20,50,30,0.88) 0%, rgba(20,50,30,0.60) 45%, rgba(20,50,30,0.08) 100%)',
        }} />
        <div style={{ position:'relative', zIndex:1, padding: isMobile ? `28px ${px}px 28px` : `52px ${px}px 48px`, maxWidth: isWide ? 580 : '60%' }}>
          <div style={{ color:'rgba(255,255,255,0.88)', fontSize: isMobile ? 13 : 15, fontWeight:600, marginBottom:8, letterSpacing:0.2 }}>🌸 봄 여행 추천</div>
          <div style={{ color:'#fff', fontWeight:800, fontSize: isMobile ? 24 : 36, lineHeight:1.25, marginBottom:12, textShadow:'0 2px 12px rgba(0,0,0,0.25)' }}>
            순천만 국가정원<br />지금이 딱 좋아요
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
            {['유아차 가능 ✓','수유실 ✓','주차 ✓'].map(t => (
              <div key={t} style={{ background:'rgba(255,255,255,0.18)', color:'#fff', fontSize: isMobile ? 11 : 13, fontWeight:600, padding:'5px 12px', borderRadius:20, backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.25)' }}>{t}</div>
            ))}
          </div>
          <button onClick={() => onSelectItem(SPOTS[0])} style={{
            background:'#fff', color:'var(--primary)', fontWeight:700, fontSize: isMobile ? 13 : 15,
            padding: isMobile ? '10px 20px' : '13px 26px', borderRadius:24,
            boxShadow:'0 4px 16px rgba(0,0,0,0.18)', transition:'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.18)'; }}
          >자세히 보기 →</button>
        </div>
      </div>

      <div style={{ padding:`28px ${px}px 0` }}>
        <SectionHeader title="🏕️ 지금 인기 생태관광지 Top 10" />
        <CardRow items={SPOTS} showRank isMobile={isMobile} cardCols={cardCols} px={px} onSelectItem={onSelectItem} />

        <SectionHeader title="🎪 지금 인기 축제 Top 10" />
        <CardRow items={FESTIVALS} showRank isMobile={isMobile} cardCols={cardCols} px={px} onSelectItem={onSelectItem} />

        <SectionHeader title="🌱 새로 생긴 곳" />
        <CardRow items={[...SPOTS, ...FESTIVALS].filter(i => i.isNew)} isMobile={isMobile} cardCols={cardCols} px={px} onSelectItem={onSelectItem} />
      </div>
    </div>
  );
}
