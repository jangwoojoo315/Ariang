'use client';
import { useState } from 'react';
import { BottomSheet, Modal, PrimaryBtn, PlaceholderImg, ThemeChip } from '@/shared/ui';
import { IcoXClose, IcoCalendar, IcoRoute, IcoCheck2, IcoStroller } from '@/shared/ui';
import { FESTIVALS } from '@/entities/spot';
import type { SpotOrFestival, Trip } from '@/shared/types';

function IconStroller({ size=22, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M4 4h2l3.5 9H17a2 2 0 0 0 2-2V8H9"/><path d="M9 13H5l-1-4"/></svg>;
}
function IconMilk({ size=22, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l1 4H7L8 2z"/><path d="M7 6v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6"/><path d="M11 11h2M11 15h2"/></svg>;
}
function IconCar({ size=22, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="6" rx="1"/><path d="M6 9l1.5-5h9L18 9"/></svg>;
}
function IconAccessible({ size=22, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M9 9h6l-1 5-3 4-3-4z"/><path d="M8 14c-1.5 1.5-2 3.5-1 5s3.5 2 5 1"/><path d="M15 9l2 6"/></svg>;
}
function IconClock({ size=16, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconTicket({ size=16, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="15" y1="9" x2="15" y2="15"/></svg>;
}
function IconUtensils({ size=16, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>;
}
function IconMap({ size=16, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
}
function IconCalendarDet({ size=16, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconCheck({ size=18, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconX({ size=18, color='currentColor' }: { size?:number; color?:string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function InfoRow({ icon, label, value, last }: { icon: React.ReactNode; label:string; value?:string; last?:boolean }) {
  if (!value) return null;
  return (
    <div style={{ display:'flex', gap:10, paddingBottom: last ? 0 : 8, marginBottom: last ? 0 : 8, borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ width:24, height:24, borderRadius:8, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{icon}</div>
      <div>
        <div style={{ fontSize:11, color:'var(--text2)', fontWeight:600, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:13, lineHeight:1.5 }}>{value}</div>
      </div>
    </div>
  );
}

export function TripSaveModal({ item, onClose, onSave }: { item: SpotOrFestival; onClose: ()=>void; onSave:(date:string)=>void }) {
  const [date, setDate] = useState('');
  const [undecided, setUndecided] = useState(true);
  const today = new Date().toISOString().slice(0,10);

  const suggested = 'dateRange' in item
    ? []
    : FESTIVALS.filter(f => f.theme === item.theme).slice(0,1);

  return (
    <Modal onClose={onClose}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
        <div style={{ width:36, height:36, borderRadius:18, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <IcoCalendar size={18} color="var(--primary)" />
        </div>
        <div style={{ fontWeight:800, fontSize:18 }}>내 여행에 추가</div>
      </div>
      <div style={{ color:'var(--text2)', fontSize:13, marginBottom:18, paddingLeft:46 }}>{item.name}</div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:'var(--text2)', fontWeight:600, marginBottom:8 }}>방문 예정일</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <button onClick={() => { setUndecided(true); setDate(''); }} style={{
            flex:1, padding:'9px 0', borderRadius:10, fontSize:13, fontWeight:700,
            background: undecided ? 'var(--primary)' : 'var(--bg)',
            color: undecided ? '#fff' : 'var(--text2)',
            border: `1.5px solid ${undecided ? 'var(--primary)' : 'var(--border)'}`,
            transition:'all 0.15s', cursor:'pointer',
          }}>미정</button>
          <button onClick={() => setUndecided(false)} style={{
            flex:2, padding:'9px 0', borderRadius:10, fontSize:13, fontWeight:700,
            background: !undecided ? 'var(--tag-bg)' : 'var(--bg)',
            color: !undecided ? 'var(--primary)' : 'var(--text2)',
            border: `1.5px solid ${!undecided ? 'var(--primary)' : 'var(--border)'}`,
            transition:'all 0.15s', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <IcoCalendar size={13} color={!undecided ? 'var(--primary)' : 'var(--text2)'} />날짜 선택
          </button>
        </div>
        {!undecided && (
          <input type="date" value={date} min={today} onChange={e => { setDate(e.target.value); setUndecided(false); }}
            style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:12, padding:'11px 14px', fontSize:15, background:'var(--bg)', color:'var(--text)' }} />
        )}
      </div>

      {suggested.length > 0 && (
        <div style={{ background:'var(--tag-bg)', borderRadius:14, padding:'12px 14px', marginBottom:18 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--primary)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <IcoRoute size={13} color="var(--primary)" />같은 날 함께 가면 좋은 곳
          </div>
          {suggested.map(b => (
            <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:52, height:44, borderRadius:10, overflow:'hidden', flexShrink:0 }}>
                <PlaceholderImg theme={b.theme} img={b.img} height={44} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.name}</div>
                <div style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>{b.region}</div>
              </div>
              <ThemeChip theme={b.theme} small />
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:'13px 0', borderRadius:14, border:'1.5px solid var(--border)', fontSize:14, fontWeight:600, color:'var(--text2)', background:'var(--bg)', cursor:'pointer' }}>취소</button>
        <PrimaryBtn onClick={() => onSave(undecided ? '' : date)} style={{ flex:2 } as React.CSSProperties}>
          <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <IcoCheck2 size={15} color="#fff" />저장하기
          </span>
        </PrimaryBtn>
      </div>
    </Modal>
  );
}

export function DetailSheet({ item, onClose, onSaveTrip, savedTrips }: { item: SpotOrFestival; onClose:()=>void; onSaveTrip:(item:SpotOrFestival,date:string)=>void; savedTrips:Trip[] }) {
  const [showSave, setShowSave] = useState(false);
  const alreadySaved = savedTrips.some(t => t.itemId === item.id);

  return (
    <>
      <BottomSheet onClose={onClose}>
        <div style={{ position:'relative' }}>
          <PlaceholderImg theme={item.theme} img={item.img} height={260} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />
          <button onClick={onClose} style={{
            position:'absolute', top:14, right:14, width:34, height:34, borderRadius:17,
            background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)',
            border:'1.5px solid rgba(255,255,255,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.65)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.45)'}
          ><IcoXClose size={16} color="#fff" /></button>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'32px 20px 20px' }}>
            <ThemeChip theme={item.theme} />
            <div style={{ color:'#fff', fontWeight:800, fontSize:22, marginTop:8, lineHeight:1.3, textShadow:'0 1px 8px rgba(0,0,0,0.4)' }}>{item.name}</div>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13, marginTop:4 }}>
              {item.region}{'dateRange' in item && item.dateRange ? ` · ${item.dateRange}` : ''}
            </div>
          </div>
        </div>

        <div style={{ padding:'18px 20px' }}>
          <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.75, marginBottom:18 }}>{item.description}</div>

          <div style={{ background:'linear-gradient(135deg, #E8F4ED 0%, #F0F7EC 100%)', border:'1.5px solid var(--border)', borderRadius:16, padding:16, marginBottom:18 }}>
            <div style={{ fontWeight:800, fontSize:13, color:'var(--primary)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <IcoStroller size={14} color="var(--primary)" /> 육아 여행 정보
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'유아차', Icon:IconStroller, ok:item.stroller, detail:item.stroller?'전 구간 가능':'비권장' },
                { label:'수유실', Icon:IconMilk,     ok:item.nursing,  detail:item.nursing?'내부 운영':'없음' },
                { label:'주차장', Icon:IconCar,      ok:item.parking,  detail:item.parking?'무료 주차':'없음' },
                { label:'배려 화장실', Icon:IconAccessible, ok:item.accessible, detail:item.accessible?'이용 가능':'없음' },
              ].map(({ label, Icon, ok, detail }) => (
                <div key={label} style={{ background: ok ? '#fff' : '#F8F8F8', borderRadius:12, padding:'10px 12px', border:`1px solid ${ok ? 'var(--border)' : '#EDEDED'}`, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background: ok ? 'var(--tag-bg)' : '#EFEFEF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={18} color={ok ? 'var(--primary)' : '#BBBBBB'} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color:'var(--text2)', fontWeight:500 }}>{label}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: ok ? 'var(--primary)' : '#B0B0B0' }}>{detail}</div>
                  </div>
                  <div style={{ width:20, height:20, borderRadius:10, flexShrink:0, background: ok ? 'var(--primary)' : '#E0E0E0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {ok ? <IconCheck size={11} color="#fff" /> : <IconX size={11} color="#fff" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--bg)', borderRadius:14, padding:'14px 16px', marginBottom:18 }}>
            <InfoRow icon={<IconClock size={15} color="var(--primary)" />} label="운영시간" value={item.hours || ('dateRange' in item ? item.dateRange : undefined)} />
            <InfoRow icon={<IconTicket size={15} color="var(--primary)" />} label="입장료" value={item.admission} />
            {item.restaurant && <InfoRow icon={<IconUtensils size={15} color="var(--primary)" />} label="식당 정보" value={item.restaurant} last />}
          </div>

          <div style={{ borderRadius:14, overflow:'hidden', marginBottom:20, border:'1px solid var(--border)' }}>
            <div style={{ background:'#EAE8E4', height:130, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
              <IconMap size={32} color="#A0A0A0" />
              <div style={{ fontSize:12, color:'var(--text2)' }}>지도 ({item.region})</div>
            </div>
          </div>

          <PrimaryBtn onClick={() => setShowSave(true)} disabled={alreadySaved} style={{ background: alreadySaved ? '#B8D4C4' : undefined }}>
            <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <IconCalendarDet size={18} color="#fff" />
              {alreadySaved ? '이미 저장된 여행지예요' : '내 여행에 추가하기'}
            </span>
          </PrimaryBtn>
        </div>
      </BottomSheet>

      {showSave && (
        <TripSaveModal item={item} onClose={() => setShowSave(false)}
          onSave={date => { onSaveTrip(item, date); setShowSave(false); onClose(); }} />
      )}
    </>
  );
}
