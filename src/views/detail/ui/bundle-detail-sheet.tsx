'use client';
import { BottomSheet, PrimaryBtn, PlaceholderImg, ThemeChip } from '@/shared/ui';
import { IcoXClose, IcoClock2, IcoRuler, IcoPin, IcoLightbulb, IcoRoute, IcoStroller, IcoCheckCircle, IcoTent, IcoFestival, IcoUtensils2, IcoHotel } from '@/shared/ui';
import type { Bundle, SpotOrFestival, Trip } from '@/shared/types';

function CourseStop({ stop, idx, total, onSelectItem, savedTrips }: {
  stop: Bundle['course'][0];
  idx: number;
  total: number;
  onSelectItem: (item: SpotOrFestival) => void;
  savedTrips: Trip[];
}) {
  const isMeal = stop.type === 'meal';
  const isStay = stop.type === 'stay';
  const isContent = stop.type === 'spot' || stop.type === 'festival';
  const isSaved = isContent && savedTrips.some(t => stop.item && t.itemId === stop.item.id);

  const dotColor = isMeal ? '#F4A044' : isStay ? '#5B8DB8' : stop.type === 'spot' ? 'var(--primary)' : '#C06080';
  const DotIcon = isMeal ? IcoUtensils2 : isStay ? IcoHotel : stop.type === 'spot' ? IcoTent : IcoFestival;

  return (
    <div style={{ display:'flex', gap:16, marginBottom: idx < total-1 ? 20 : 0, position:'relative', zIndex:1 }}>
      <div style={{ width:38, height:38, borderRadius:19, flexShrink:0, background:dotColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:`0 0 0 4px var(--bg)`, border:`2px solid ${dotColor}` }}>
        <DotIcon size={16} color="#fff" />
      </div>
      <div style={{ flex:1, paddingTop:4, paddingBottom: idx < total-1 ? 4 : 0 }}>
        <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:4, letterSpacing:0.3 }}>STOP {idx+1}</div>
        {isContent && stop.item ? (
          <div style={{ background:'var(--surface)', borderRadius:14, border:'1.5px solid var(--border)', overflow:'hidden', cursor:'pointer', transition:'box-shadow 0.15s, transform 0.15s' }}
            onClick={() => onSelectItem(stop.item!)}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform=''; }}
          >
            <div style={{ display:'flex' }}>
              <div style={{ width:90, flexShrink:0 }}>
                <PlaceholderImg theme={stop.item.theme} img={stop.item.img} height={90} />
              </div>
              <div style={{ flex:1, padding:'10px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <ThemeChip theme={stop.item.theme} small />
                  {stop.label && <span style={{ fontSize:10, color:'var(--text2)', fontWeight:600 }}>{stop.label}</span>}
                </div>
                <div style={{ fontWeight:700, fontSize:14, lineHeight:1.35, marginBottom:3 }}>{stop.item.name}</div>
                <div style={{ fontSize:11, color:'var(--text2)', marginBottom:5 }}>{stop.item.region}</div>
                {isSaved && <span style={{ fontSize:10, color:'var(--primary)', fontWeight:700, display:'flex', alignItems:'center', gap:3 }}><IcoCheckCircle size={11} color="var(--primary)" />저장됨</span>}
              </div>
            </div>
            {stop.tip && (
              <div style={{ padding:'9px 14px', background:'#F8FBF6', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'flex-start' }}>
                <IcoLightbulb size={13} color="var(--primary)" />
                <span style={{ fontSize:12, color:'var(--text2)', lineHeight:1.55 }}>{stop.tip}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'var(--surface)', borderRadius:14, border:'1.5px solid var(--border)', padding:'12px 14px' }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{stop.label}</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.65 }}>{stop.desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  bundle: Bundle;
  onClose: () => void;
  onSelectItem: (item: SpotOrFestival) => void;
  onSaveTrip: (item: SpotOrFestival, date: string) => void;
  savedTrips: Trip[];
}

export function BundleDetailSheet({ bundle, onClose, onSelectItem, onSaveTrip, savedTrips }: Props) {
  const stops = bundle.course || [];
  const spotFestivalStops = stops.filter(s => s.type === 'spot' || s.type === 'festival');

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', height:220, overflow:'hidden' }}>
          {spotFestivalStops.slice(0,3).map((s,i) => (
            <div key={i} style={{ flex:1, overflow:'hidden' }}>
              <PlaceholderImg theme={s.item?.theme || bundle.theme} img={s.item?.img} height={220} />
            </div>
          ))}
        </div>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14, width:34, height:34, borderRadius:17,
          background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)',
          border:'1.5px solid rgba(255,255,255,0.35)', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
        }}>
          <IcoXClose size={16} color="#fff" />
        </button>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'28px 20px 18px' }}>
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            <div style={{ background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>번들</div>
            <div style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}><IcoClock2 size={11} color="#fff" />{bundle.duration}</div>
            <div style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}><IcoRuler size={11} color="#fff" />{bundle.distance}</div>
            {bundle.stroller && <div style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}><IcoStroller size={11} color="#fff" />유아차</div>}
          </div>
          <div style={{ color:'#fff', fontWeight:800, fontSize:24, lineHeight:1.3, textShadow:'0 1px 8px rgba(0,0,0,0.4)' }}>{bundle.title}</div>
          <div style={{ color:'rgba(255,255,255,0.82)', fontSize:13, marginTop:4, display:'flex', alignItems:'center', gap:4 }}><IcoPin size={12} color="rgba(255,255,255,0.82)" />{bundle.region}</div>
        </div>
      </div>

      <div style={{ padding:'18px 20px' }}>
        <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.75, marginBottom:22 }}>{bundle.description}</div>

        <div style={{ fontWeight:800, fontSize:16, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <IcoRoute size={16} color="var(--primary)" /> 여행 코스
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:19, top:24, bottom:24, width:2, background:'var(--border)', zIndex:0 }} />
          {stops.map((stop,idx) => (
            <CourseStop key={idx} stop={stop} idx={idx} total={stops.length} onSelectItem={onSelectItem} savedTrips={savedTrips} />
          ))}
        </div>

        <div style={{ marginTop:24, background:'var(--tag-bg)', borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
          <div style={{ fontSize:13, color:'var(--primary)', fontWeight:700, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}><IcoLightbulb size={13} color="var(--primary)" /> 번들 전체 저장</div>
          <div style={{ fontSize:12, color:'var(--text2)', marginBottom:12, lineHeight:1.6 }}>코스 내 관광지·축제를 한 번에 내 여행에 저장하세요.</div>
          <PrimaryBtn onClick={() => {
            spotFestivalStops.forEach(s => {
              if (s.item && !savedTrips.some(t => t.itemId === s.item!.id)) {
                onSaveTrip(s.item, '');
              }
            });
            onClose();
          }}>
            번들 전체 내 여행에 추가 ✓
          </PrimaryBtn>
        </div>
      </div>
    </BottomSheet>
  );
}
