'use client';
import { useState } from 'react';
import { PlaceholderImg, Modal, PrimaryBtn } from '@/shared/ui';
import { IcoRoute, IcoCalendar, IcoArrowRight, IcoTrash, IcoSearch, IcoXClose, IcoPack, IcoCheck2, IcoChevronLeft, IcoChevronRight } from '@/shared/ui';
import { useWindowWidth } from '@/shared/lib';
import type { Trip, SpotOrFestival } from '@/shared/types';

interface Props {
  savedTrips: Trip[];
  onUpdateChecklist: (tripId: number, items: Trip['checklist']) => void;
  onDeleteTrip: (tripId: number) => void;
  onSelectItem: (item: SpotOrFestival) => void;
  onUpdateDate: (tripId: number, newDate: string) => void;
}

export function TripsScreen({ savedTrips, onUpdateChecklist, onDeleteTrip, onSelectItem, onUpdateDate }: Props) {
  const [view, setView] = useState<'list'|'calendar'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip|null>(null);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  const grouped = savedTrips.reduce<Record<string, Trip[]>>((acc, trip) => {
    const key = trip.date ? trip.date.slice(0,7) : '날짜 미정';
    if (!acc[key]) acc[key] = [];
    acc[key].push(trip);
    return acc;
  }, {});

  if (selectedTrip) {
    return (
      <ChecklistScreen
        trip={selectedTrip}
        onBack={() => setSelectedTrip(null)}
        onUpdate={items => { onUpdateChecklist(selectedTrip.id, items); setSelectedTrip(t => t ? {...t, checklist:items} : null); }}
      />
    );
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--surface)', padding:`20px ${px}px 0`, borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ fontWeight:800, fontSize:22, marginBottom:14 }}>내 여행</div>
        <div style={{ display:'flex', gap:0 }}>
          {[['list','목록'],['calendar','캘린더']].map(([key,label]) => (
            <button key={key} onClick={() => setView(key as 'list'|'calendar')} style={{
              flex:1, padding:'8px 0', fontWeight:700, fontSize:14,
              borderBottom: view===key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: view===key ? 'var(--primary)' : 'var(--text2)', transition:'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {view === 'calendar' ? (
        <div style={{ flex:1, overflow:'hidden', display:'flex', minHeight:0 }}>
          <CalendarView trips={savedTrips} onSelect={setSelectedTrip} onDeleteTrip={onDeleteTrip} onSelectItem={onSelectItem} />
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', padding:`16px ${px}px`, paddingBottom: isMobile ? 80 : 24 }} className="no-scroll">
          {savedTrips.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:80, textAlign:'center' }}>
              <div style={{ marginBottom:16 }}><IcoRoute size={56} color="var(--border)" /></div>
              <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>아직 저장된 여행이 없어요</div>
              <div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.65 }}>탐색 탭에서 마음에 드는 생태관광지나<br />축제를 저장해 보세요!</div>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).sort().map(([month, trips]) => (
                <div key={month} style={{ marginBottom:24 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:10 }}>
                    {month === '날짜 미정' ? month : `${month.slice(0,4)}년 ${parseInt(month.slice(5))}월`}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[...trips].sort((a,b) => a.date > b.date ? 1 : -1).map(trip => (
                      <TripCard key={trip.id} trip={trip} onSelect={() => setSelectedTrip(trip)} onDelete={() => onDeleteTrip(trip.id)} onSelectItem={onSelectItem} onUpdateDate={onUpdateDate} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, onSelect, onDelete, onSelectItem, onUpdateDate }: {
  trip: Trip; onSelect:()=>void; onDelete:()=>void;
  onSelectItem:(item:SpotOrFestival)=>void;
  onUpdateDate:(id:number,date:string)=>void;
}) {
  const done = trip.checklist ? trip.checklist.filter(i => i.checked).length : 0;
  const total = trip.checklist ? trip.checklist.length : 0;
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  const daysUntil = trip.date ? Math.ceil((new Date(trip.date).getTime() - new Date().getTime()) / 86400000) : null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDateEdit, setShowDateEdit] = useState(false);

  return (
    <>
    <div style={{ background:'var(--surface)', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', transition:'transform 0.15s', display:'flex', gap:14, alignItems:'center' }}
      onMouseEnter={e => e.currentTarget.style.transform='translateX(3px)'}
      onMouseLeave={e => e.currentTarget.style.transform=''}
    >
      <div onClick={onSelect} style={{ width:54, height:54, borderRadius:14, overflow:'hidden', flexShrink:0, cursor:'pointer' }}>
        <PlaceholderImg theme={trip.item?.theme || 'forest'} img={trip.item?.img} height={54} />
      </div>
      <div onClick={onSelect} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{trip.item?.name}</div>
        <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
          <IcoCalendar size={12} color="var(--text3)" />
          {trip.date ? trip.date.replace(/-/g,'.') : '날짜 미정'}
          {daysUntil !== null && daysUntil >= 0 && daysUntil <= 30 && (
            <span style={{ color: daysUntil<=1 ? '#E57373' : 'var(--accent)', fontWeight:700 }}>
              {daysUntil===0 ? '오늘!' : daysUntil===1 ? 'D-1' : `D-${daysUntil}`}
            </span>
          )}
        </div>
        {total > 0 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, color:'var(--text2)' }}>준비물 체크리스트</span>
              <span style={{ fontSize:11, fontWeight:700, color: pct===100 ? 'var(--primary)' : 'var(--text2)' }}>{done}/{total}</span>
            </div>
            <div style={{ height:4, background:'#EEE', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background: pct===100 ? 'var(--primary)' : 'var(--accent)', borderRadius:2, transition:'width 0.4s' }} />
            </div>
          </div>
        )}
        {trip.item && (
          <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
            <button onClick={e => { e.stopPropagation(); onSelectItem(trip.item); }} style={{
              display:'inline-flex', alignItems:'center', gap:5, background:'var(--bg)', border:'1.5px solid var(--border)',
              borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:600, color:'var(--primary)', cursor:'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--tag-bg)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg)'}
            ><IcoSearch size={11} color="var(--primary)" />여행지 정보보기</button>
            <button onClick={e => { e.stopPropagation(); setShowDateEdit(true); }} style={{
              display:'inline-flex', alignItems:'center', gap:5, background:'var(--bg)', border:'1.5px solid var(--border)',
              borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:600, color:'var(--text2)', cursor:'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background='#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg)'}
            ><IcoCalendar size={11} color="var(--text2)" />날짜 수정</button>
          </div>
        )}
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
        <div onClick={onSelect} style={{ color:'var(--text3)', cursor:'pointer', padding:'4px' }}>
          <IcoArrowRight size={18} color="var(--text3)" />
        </div>
        {confirmDelete ? (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ fontSize:11, fontWeight:700, color:'#fff', background:'#E57373', border:'none', borderRadius:8, padding:'4px 8px', cursor:'pointer' }}>삭제</button>
            <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ fontSize:11, color:'var(--text2)', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'4px 8px', cursor:'pointer' }}>취소</button>
          </div>
        ) : (
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} style={{ color:'var(--text3)', padding:'4px', cursor:'pointer', lineHeight:1, background:'none', border:'none' }}>
            <IcoTrash size={15} color="var(--text3)" />
          </button>
        )}
      </div>
    </div>
    {showDateEdit && (
      <DateEditModal trip={trip} onClose={() => setShowDateEdit(false)} onSave={newDate => { onUpdateDate(trip.id, newDate); setShowDateEdit(false); }} />
    )}
    </>
  );
}

function DateEditModal({ trip, onClose, onSave }: { trip:Trip; onClose:()=>void; onSave:(date:string)=>void }) {
  const [undecided, setUndecided] = useState(!trip.date);
  const [date, setDate] = useState(trip.date || '');
  const today = new Date().toISOString().slice(0,10);
  return (
    <Modal onClose={onClose}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
        <div style={{ width:36, height:36, borderRadius:18, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <IcoCalendar size={18} color="var(--primary)" />
        </div>
        <div style={{ fontWeight:800, fontSize:18 }}>날짜 수정</div>
      </div>
      <div style={{ color:'var(--text2)', fontSize:13, marginBottom:18, paddingLeft:46 }}>{trip.item?.name}</div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:'var(--text2)', fontWeight:600, marginBottom:8 }}>방문 예정일</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <button onClick={() => { setUndecided(true); setDate(''); }} style={{
            flex:1, padding:'9px 0', borderRadius:10, fontSize:13, fontWeight:700,
            background: undecided ? 'var(--primary)' : 'var(--bg)',
            color: undecided ? '#fff' : 'var(--text2)',
            border: `1.5px solid ${undecided ? 'var(--primary)' : 'var(--border)'}`,
            cursor:'pointer', transition:'all 0.15s',
          }}>미정</button>
          <button onClick={() => setUndecided(false)} style={{
            flex:2, padding:'9px 0', borderRadius:10, fontSize:13, fontWeight:700,
            background: !undecided ? 'var(--tag-bg)' : 'var(--bg)',
            color: !undecided ? 'var(--primary)' : 'var(--text2)',
            border: `1.5px solid ${!undecided ? 'var(--primary)' : 'var(--border)'}`,
            cursor:'pointer', transition:'all 0.15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <IcoCalendar size={13} color={!undecided ? 'var(--primary)' : 'var(--text2)'} />날짜 선택
          </button>
        </div>
        {!undecided && (
          <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
            style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:12, padding:'11px 14px', fontSize:15, background:'var(--bg)', color:'var(--text)' }} />
        )}
      </div>
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

function CalendarView({ trips, onSelect, onDeleteTrip, onSelectItem }: { trips:Trip[]; onSelect:(t:Trip)=>void; onDeleteTrip:(id:number)=>void; onSelectItem:(item:SpotOrFestival)=>void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number|null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const tripDates: Record<number, Trip[]> = {};
  trips.forEach(t => {
    if (t.date && t.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)) {
      const d = parseInt(t.date.slice(8));
      if (!tripDates[d]) tripDates[d] = [];
      tripDates[d].push(t);
    }
  });

  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const DAYS = ['일','월','화','수','목','금','토'];
  const today = new Date();

  const handleDayClick = (day: number, dayTrips: Trip[]) => {
    if (!dayTrips.length) return;
    if (selectedDay === day) { setPanelVisible(false); setTimeout(() => setSelectedDay(null), 280); }
    else { setSelectedDay(day); setPanelVisible(true); }
  };

  const selectedTrips = selectedDay ? (tripDates[selectedDay] || []) : [];

  return (
    <div style={{ display:'flex', height:'100%', minHeight:0, width:'100%' }}>
      <div style={{ flex: panelVisible ? '0 0 55%' : '0 0 100%', minWidth:0, padding:'16px 16px 80px', transition:'flex 0.28s cubic-bezier(0.32,0.72,0,1)', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexShrink:0 }}>
          <button onClick={() => { setSelectedDay(null); setPanelVisible(false); if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }}
            style={{ width:36, height:36, borderRadius:18, background:'var(--surface)', boxShadow:'0 1px 6px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none' }}>
            <IcoChevronLeft size={18} color="var(--text)" />
          </button>
          <div style={{ fontWeight:800, fontSize:18 }}>{year}년 {MONTHS[month]}</div>
          <button onClick={() => { setSelectedDay(null); setPanelVisible(false); if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }}
            style={{ width:36, height:36, borderRadius:18, background:'var(--surface)', boxShadow:'0 1px 6px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none' }}>
            <IcoChevronRight size={18} color="var(--text)" />
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8, flexShrink:0 }}>
          {DAYS.map((d,i) => (
            <div key={d} style={{ textAlign:'center', fontSize:12, fontWeight:700, color: i===0 ? '#E57373' : i===6 ? '#5B8DB8' : 'var(--text2)', padding:'4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, flex:1, alignContent:'stretch' }}>
          {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_,i) => {
            const day = i+1;
            const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
            const dayTrips = tripDates[day] || [];
            const isSelected = selectedDay===day;
            const hasTrips = dayTrips.length > 0;
            return (
              <div key={day} onClick={() => handleDayClick(day, dayTrips)} style={{
                borderRadius:10, cursor: hasTrips ? 'pointer' : 'default',
                background: isSelected ? 'var(--primary)' : isToday ? 'transparent' : hasTrips ? 'var(--tag-bg)' : 'transparent',
                border: isToday ? '2px solid var(--primary)' : hasTrips && !isSelected ? '1.5px solid var(--border)' : 'none',
                transition:'all 0.15s', padding:'6px 2px 5px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              }}>
                <div style={{ fontSize:13, fontWeight: isToday||hasTrips ? 700 : 400, color: isSelected ? '#fff' : isToday ? 'var(--primary)' : hasTrips ? 'var(--primary)' : 'var(--text)' }}>{day}</div>
                {hasTrips && (
                  <div style={{ width:'100%', paddingInline:2, display:'flex', flexDirection:'column', gap:2 }}>
                    {dayTrips.slice(0,2).map((t,ti) => (
                      <div key={ti} style={{ fontSize:8, fontWeight:700, lineHeight:1.4, color: isSelected ? '#fff' : 'var(--primary)', background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--surface)', border:`1px solid ${isSelected ? 'rgba(255,255,255,0.35)' : 'var(--border)'}`, borderRadius:20, padding:'2px 4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center', display:'block' }}>{t.item?.name}</div>
                    ))}
                    {dayTrips.length > 2 && <div style={{ fontSize:8, fontWeight:700, textAlign:'center', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text2)', background: isSelected ? 'rgba(255,255,255,0.15)' : '#F0F0F0', borderRadius:20, padding:'2px 4px', width:'100%' }}>+{dayTrips.length-2}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: panelVisible ? '0 0 45%' : '0 0 0%', overflow:'hidden', transition:'flex 0.28s cubic-bezier(0.32,0.72,0,1)', flexShrink:0, borderLeft: panelVisible ? '1.5px solid var(--border)' : 'none', background:'var(--surface)', display:'flex', flexDirection:'column' }}>
        <div style={{ width:'100%', padding:'16px 16px 0', display:'flex', flexDirection:'column', height:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{selectedDay && `${month+1}월 ${selectedDay}일`}</div>
            <button onClick={() => { setPanelVisible(false); setTimeout(()=>setSelectedDay(null),280); }} style={{ width:28, height:28, borderRadius:14, background:'var(--bg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <IcoXClose size={14} color="var(--text2)" />
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, overflowY:'auto', flex:1, paddingBottom:80 }} className="no-scroll">
            {selectedTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onSelect={() => onSelect(trip)} onDelete={() => { onDeleteTrip(trip.id); if(selectedTrips.length<=1){setPanelVisible(false);setSelectedDay(null);} }} onSelectItem={onSelectItem} onUpdateDate={() => {}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistScreen({ trip, onBack, onUpdate }: { trip:Trip; onBack:()=>void; onUpdate:(items:Trip['checklist'])=>void }) {
  const [items, setItems] = useState(trip.checklist || []);
  const [newItem, setNewItem] = useState('');
  const done = items.filter(i => i.checked).length;

  const toggle = (idx: number) => {
    const next = items.map((it,i) => i===idx ? {...it,checked:!it.checked} : it);
    setItems(next); onUpdate(next);
  };
  const addItem = () => {
    if (!newItem.trim()) return;
    const next = [...items, {label:newItem.trim(),checked:false}];
    setItems(next); onUpdate(next); setNewItem('');
  };
  const removeItem = (idx: number) => {
    const next = items.filter((_,i) => i!==idx);
    setItems(next); onUpdate(next);
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--surface)', padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'4px', background:'none', border:'none', cursor:'pointer' }}>
          <IcoChevronLeft size={24} color="var(--text)" />
        </button>
        <div>
          <div style={{ fontWeight:800, fontSize:16, display:'flex', alignItems:'center', gap:6 }}>
            <IcoPack size={16} color="var(--primary)" /> 준비물 체크리스트
          </div>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{trip.item?.name} · {done}/{items.length}개 완료</div>
        </div>
      </div>
      <div style={{ padding:'12px 20px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ height:6, background:'#EEE', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${items.length ? done/items.length*100 : 0}%`, background:'var(--primary)', borderRadius:3, transition:'width 0.4s' }} />
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }} className="no-scroll">
        {items.map((item, idx) => (
          <div key={idx} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--surface)', borderRadius:12, marginBottom:8, border:'1px solid var(--border)', opacity: item.checked ? 0.65 : 1, transition:'opacity 0.2s' }}>
            <button onClick={() => toggle(idx)} style={{ width:24, height:24, borderRadius:12, border:`2px solid ${item.checked ? 'var(--primary)' : '#CCC'}`, background: item.checked ? 'var(--primary)' : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, transition:'all 0.15s', cursor:'pointer' }}>
              {item.checked && <IcoCheck2 size={11} color="#fff" />}
            </button>
            <span style={{ flex:1, fontSize:15, textDecoration: item.checked ? 'line-through' : 'none' }}>{item.label}</span>
            <button onClick={() => removeItem(idx)} style={{ color:'#CCC', padding:'0 4px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <IcoXClose size={16} color="#CCC" />
            </button>
          </div>
        ))}
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key==='Enter' && addItem()}
            placeholder="항목 추가..." style={{ flex:1, border:'1.5px solid var(--border)', borderRadius:12, padding:'11px 14px', fontSize:14, background:'var(--bg)', outline:'none' }} />
          <button onClick={addItem} style={{ background:'var(--primary)', color:'#fff', borderRadius:12, padding:'0 18px', fontWeight:700, fontSize:14, cursor:'pointer' }}>+</button>
        </div>
      </div>
    </div>
  );
}
