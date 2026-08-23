'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PlaceholderImg, Modal, PrimaryBtn } from '@/shared/ui';
import { IcoRoute, IcoCalendar, IcoArrowRight, IcoTrash, IcoSearch, IcoXClose, IcoPack, IcoCheck2, IcoChevronLeft } from '@/shared/ui';
import { useWindowWidth } from '@/shared/lib';
import { mapTourSpotToSpot } from '@/entities/spot';
import {
  useGetMyTourList,
  deleteMyTour,
  updateMyTourVisitDate,
  updateChecklist,
  getGetMyTourListQueryKey,
} from '@/shared/api/generated/my-tour/my-tour';
import type { MyTour, ChecklistItemInput } from '@/shared/api/generated/model';
import type { SpotOrFestival } from '@/shared/types';

interface Props {
  onSelectItem: (item: SpotOrFestival) => void;
}

export function TripsScreen({ onSelectItem }: Props) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useGetMyTourList();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  const trips = data ?? [];
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getGetMyTourListQueryKey() });

  const handleDelete = async (id: number) => {
    await deleteMyTour(id);
    invalidate();
  };
  const handleUpdateDate = async (id: number, date: string) => {
    await updateMyTourVisitDate(id, { visitDate: date || null });
    invalidate();
  };
  const handleUpdateChecklist = async (id: number, checklist: ChecklistItemInput[]) => {
    await updateChecklist(id, { checklist });
    invalidate();
  };

  const grouped = trips.reduce<Record<string, MyTour[]>>((acc, trip) => {
    const key = trip.visitDate ? trip.visitDate.slice(0, 7) : '날짜 미정';
    (acc[key] ??= []).push(trip);
    return acc;
  }, {});

  const selectedTrip = selectedId !== null ? trips.find(t => t.id === selectedId) : null;
  if (selectedTrip) {
    return (
      <ChecklistScreen
        trip={selectedTrip}
        onBack={() => setSelectedId(null)}
        onUpdate={items => handleUpdateChecklist(selectedTrip.id, items)}
      />
    );
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--surface)', padding:`20px ${px}px 16px`, borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ fontWeight:800, fontSize:22 }}>내 여행</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:`16px ${px}px`, paddingBottom: isMobile ? 80 : 24 }} className="no-scroll">
        {isLoading ? (
          <div style={{ textAlign:'center', paddingTop:80, color:'var(--text2)', fontSize:14 }}>불러오는 중…</div>
        ) : isError ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:80, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>여행 정보를 불러오지 못했어요</div>
            <div style={{ color:'var(--text2)', fontSize:14 }}>잠시 후 다시 시도해 주세요</div>
          </div>
        ) : trips.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:80, textAlign:'center' }}>
            <div style={{ marginBottom:16 }}><IcoRoute size={56} color="var(--border)" /></div>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>아직 저장된 여행이 없어요</div>
            <div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.65 }}>검색 탭에서 마음에 드는 생태관광지나<br />축제를 저장해 보세요!</div>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).sort().map(([month, monthTrips]) => (
              <div key={month} style={{ marginBottom:24 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:10 }}>
                  {month === '날짜 미정' ? month : `${month.slice(0,4)}년 ${parseInt(month.slice(5))}월`}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[...monthTrips].sort((a,b) => (a.visitDate ?? '') > (b.visitDate ?? '') ? 1 : -1).map(trip => (
                    <TripCard key={trip.id} trip={trip} onSelect={() => setSelectedId(trip.id)} onDelete={() => handleDelete(trip.id)} onSelectItem={onSelectItem} onUpdateDate={handleUpdateDate} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect, onDelete, onSelectItem, onUpdateDate }: {
  trip: MyTour; onSelect:()=>void; onDelete:()=>void;
  onSelectItem:(item:SpotOrFestival)=>void;
  onUpdateDate:(id:number,date:string)=>void;
}) {
  const spot = mapTourSpotToSpot(trip.tourInfo, 'forest');
  const date = trip.visitDate;
  const checklist = trip.checklist ?? [];
  const done = checklist.filter(i => i.checked).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  // 달력 날짜(로컬 자정) 기준 남은 일수. 지난 날짜는 음수 → 배지 미표시.
  const daysUntil = (() => {
    if (!date) return null;
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) return null;
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  })();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDateEdit, setShowDateEdit] = useState(false);

  return (
    <>
    <div style={{ background:'var(--surface)', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', transition:'transform 0.15s', display:'flex', gap:14, alignItems:'center' }}
      onMouseEnter={e => e.currentTarget.style.transform='translateX(3px)'}
      onMouseLeave={e => e.currentTarget.style.transform=''}
    >
      <div onClick={onSelect} style={{ width:54, height:54, borderRadius:14, overflow:'hidden', flexShrink:0, cursor:'pointer' }}>
        <PlaceholderImg theme={spot.theme} img={spot.img} height={54} />
      </div>
      <div onClick={onSelect} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{spot.name}</div>
        <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
          <IcoCalendar size={12} color="var(--text3)" />
          {date ? date.replace(/-/g,'.') : '날짜 미정'}
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
        <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
          <button onClick={e => { e.stopPropagation(); onSelectItem(spot); }} style={{
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

function DateEditModal({ trip, onClose, onSave }: { trip:MyTour; onClose:()=>void; onSave:(date:string)=>void }) {
  const [undecided, setUndecided] = useState(!trip.visitDate);
  const [date, setDate] = useState(trip.visitDate || '');
  const today = new Date().toISOString().slice(0,10);
  return (
    <Modal onClose={onClose}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
        <div style={{ width:36, height:36, borderRadius:18, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <IcoCalendar size={18} color="var(--primary)" />
        </div>
        <div style={{ fontWeight:800, fontSize:18 }}>날짜 수정</div>
      </div>
      <div style={{ color:'var(--text2)', fontSize:13, marginBottom:18, paddingLeft:46 }}>{trip.tourInfo.name}</div>
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

function ChecklistScreen({ trip, onBack, onUpdate }: { trip:MyTour; onBack:()=>void; onUpdate:(items:ChecklistItemInput[])=>void }) {
  // 요청은 {text, checked}만 보내는 전체 교체 방식이라 id 없이 관리한다.
  const [items, setItems] = useState<ChecklistItemInput[]>(
    (trip.checklist ?? []).map(c => ({ text: c.text, checked: c.checked })),
  );
  const [newItem, setNewItem] = useState('');
  const done = items.filter(i => i.checked).length;

  const toggle = (idx: number) => {
    const next = items.map((it,i) => i===idx ? {...it,checked:!it.checked} : it);
    setItems(next); onUpdate(next);
  };
  const addItem = () => {
    if (!newItem.trim()) return;
    const next = [...items, { checked:false, text:newItem.trim() }];
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
          <div style={{ fontSize:12, color:'var(--text2)' }}>{trip.tourInfo.name} · {done}/{items.length}개 완료</div>
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
            <span style={{ flex:1, fontSize:15, textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
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
