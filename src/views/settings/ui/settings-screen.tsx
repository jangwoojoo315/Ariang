'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, PrimaryBtn } from '@/shared/ui';
import { useWindowWidth, clearTokens } from '@/shared/lib';
import {
  useGetUserInfo,
  updateChildren,
  updateAlarmSetting,
  getGetUserInfoQueryKey,
} from '@/shared/api/generated/user/user';
import type { Child, ChildInput, UserInfo } from '@/shared/api/generated/model';

function Toggle({ active, onChange, disabled = false }: { active: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={disabled ? undefined : onChange} disabled={disabled} style={{ width:46, height:26, borderRadius:13, background: active ? 'var(--primary)' : '#D0D0D0', position:'relative', transition:'background 0.2s', flexShrink:0, border:'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1 }}>
      <div style={{ position:'absolute', top:3, left: active ? 23 : 3, width:20, height:20, borderRadius:10, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s' }} />
    </button>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <div style={{ background:'var(--surface)', borderRadius:16, padding:'4px 16px', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>{children}</div>;
}

function SettingsRow({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>{left}</div>
      <div style={{ flexShrink:0 }}>{right}</div>
    </div>
  );
}

function SettingsSection({ title, children, px }: { title:string; children:React.ReactNode; px:number }) {
  return (
    <div style={{ paddingTop:0, paddingRight:px, paddingBottom:0, paddingLeft:px, marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:8, letterSpacing:0.5 }}>{title}</div>
      <SettingsCard>{children}</SettingsCard>
    </div>
  );
}

function EditChildModal({ child, onSave, onClose, title = '아이 정보 편집' }: { child: ChildInput; onSave:(c:ChildInput)=>void; onClose:()=>void; title?: string }) {
  const [form, setForm] = useState(child);
  return (
    <>
      <div style={{ fontWeight:800, fontSize:18, marginBottom:18 }}>{title}</div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, color:'var(--text2)', fontWeight:600, marginBottom:6 }}>이름</div>
        <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="예: 민준" style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', fontSize:14, outline:'none' }} />
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:'var(--text2)', fontWeight:600, marginBottom:6 }}>생년월일</div>
        <input type="date" value={form.birth} onChange={e => setForm(f=>({...f,birth:e.target.value}))} style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', fontSize:14 }} />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid var(--border)', fontSize:14, fontWeight:600, color:'var(--text2)', cursor:'pointer' }}>취소</button>
        <PrimaryBtn onClick={() => onSave(form)} style={{ flex:2 } as React.CSSProperties}>저장</PrimaryBtn>
      </div>
    </>
  );
}

function getAge(birth: string, now: number): string | null {
  if (!birth) return null;
  const diff = now - new Date(birth).getTime();
  const months = Math.floor(diff / (1000*60*60*24*30.44));
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months/12);
  const rem = months%12;
  return rem > 0 ? `${years}세 ${rem}개월` : `${years}세`;
}

export function SettingsScreen() {
  const qc = useQueryClient();
  const { data: userInfo, isLoading, isError } = useGetUserInfo();
  const [editingChild, setEditingChild] = useState<number|null>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [deletingChild, setDeletingChild] = useState<number|null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [now] = useState(() => Date.now());
  // 토글 즉시 반응용 로컬 상태 (서버 값이 바뀌면 렌더 중 동기화)
  // calendarSyncEnabled(톡캘린더 등록)가 꺼지면 D-1·당일 알림도 비활성화된다.
  const [alarm, setAlarm] = useState({
    calendarSyncEnabled: false,
    dayBeforeTodoEnabled: false,
    dayAlarmEnabled: false,
  });
  const [syncedFrom, setSyncedFrom] = useState<UserInfo | undefined>(undefined);
  if (userInfo && userInfo !== syncedFrom) {
    setSyncedFrom(userInfo);
    setAlarm({
      calendarSyncEnabled: userInfo.calendarSyncEnabled,
      dayBeforeTodoEnabled: userInfo.dayBeforeTodoEnabled,
      dayAlarmEnabled: userInfo.dayAlarmEnabled,
    });
  }
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  const children: Child[] = userInfo?.children ?? [];
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getGetUserInfoQueryKey() });

  // 자녀 정보는 배열 전체 교체(id 없이 {name, birth}만 전송).
  const saveChildren = async (next: ChildInput[]) => {
    await updateChildren({ children: next });
    invalidate();
  };
  const toChildInput = (c: Child): ChildInput => ({ name: c.name, birth: c.birth });
  const removeChild = (i: number) =>
    saveChildren(children.map(toChildInput).filter((_, idx) => idx !== i));

  // 알림 토글: 로컬 state를 즉시 바꿔 애니메이션이 지연 없이 움직이게 하고,
  // 서버 요청은 뒤에서 처리한다. 실패하면 로컬 값을 되돌린다.
  const toggleAlarm = async (
    field: 'dayBeforeTodoEnabled' | 'dayAlarmEnabled',
    value: boolean,
  ) => {
    setAlarm((a) => ({ ...a, [field]: value })); // 즉시 반영(동기)
    try {
      await updateAlarmSetting({ [field]: value });
    } catch {
      setAlarm((a) => ({ ...a, [field]: !value })); // 롤백
    }
  };

  // 톡캘린더 등록(calendarSyncEnabled) 토글: 끄면 D-1·당일 알림도 함께 꺼서
  // 한 번의 요청으로 서버와 동기화한다. (알림은 캘린더 일정에 붙는 것이라
  // 캘린더 없이는 의미가 없으므로)
  const toggleCalendar = async (value: boolean) => {
    const prev = alarm;
    const next = value
      ? { ...alarm, calendarSyncEnabled: true }
      : { calendarSyncEnabled: false, dayBeforeTodoEnabled: false, dayAlarmEnabled: false };
    setAlarm(next);
    try {
      await updateAlarmSetting(
        value
          ? { calendarSyncEnabled: true }
          : { calendarSyncEnabled: false, dayBeforeTodoEnabled: false, dayAlarmEnabled: false },
      );
    } catch {
      setAlarm(prev); // 롤백
    }
  };

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom: isMobile ? 80 : 24 }} className="no-scroll">
      <div style={{ paddingTop:24, paddingRight:px, paddingBottom:0, paddingLeft:px }}>
        <div style={{ fontWeight:800, fontSize:22, marginBottom:20 }}>설정 ⚙️</div>
      </div>

      <div style={{ paddingTop:0, paddingRight:px, paddingBottom:0, paddingLeft:px, marginBottom:8 }}>
        <SettingsCard>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'4px 0 12px' }}>
            <div style={{ width:56, height:56, borderRadius:28, background:'linear-gradient(135deg, var(--primary), var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🌿</div>
            <div>
              <div style={{ fontWeight:800, fontSize:17 }}>{userInfo?.name || '사용자'}</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>카카오로 로그인 중</div>
            </div>
          </div>
        </SettingsCard>
      </div>

      {isError ? (
        <div style={{ padding:`24px ${px}px`, color:'var(--text2)', fontSize:14, textAlign:'center' }}>정보를 불러오지 못했어요.</div>
      ) : (
      <>
      <SettingsSection title="👶 아이 프로필" px={px}>
        {isLoading ? (
          <div style={{ padding:'16px 0', color:'var(--text2)', fontSize:13 }}>불러오는 중…</div>
        ) : (
          <>
        {children.map((child, i) => (
          <SettingsRow key={child.id ?? i}
            left={<>
              <div style={{ width:36, height:36, borderRadius:18, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🧒</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{child.name || `아이 ${i+1}`}</div>
                {child.birth && <div style={{ fontSize:12, color:'var(--text2)', marginTop:1 }}>{getAge(child.birth, now)} ({child.birth})</div>}
              </div>
            </>}
            right={<div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setEditingChild(i)} style={{ color:'var(--primary)', fontSize:13, fontWeight:600 }}>편집</button>
              <button onClick={() => setDeletingChild(i)} style={{ color:'#E57373', fontSize:13, fontWeight:600 }}>삭제</button>
            </div>}
          />
        ))}
        <button style={{ width:'100%', border:'2px dashed var(--border)', borderRadius:12, padding:'11px 0', color:'var(--primary)', fontWeight:600, fontSize:14, marginTop:4, cursor:'pointer' }}
          onClick={() => setAddingChild(true)}>
          + 아이 추가
        </button>
          </>
        )}
      </SettingsSection>

      <SettingsSection title="🔔 알림 설정" px={px}>
        <SettingsRow
          left={<div><div style={{ fontWeight:600, fontSize:15 }}>톡캘린더 등록</div><div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>여행 일정을 카카오 톡캘린더에 자동 등록</div></div>}
          right={<Toggle active={alarm.calendarSyncEnabled} onChange={() => toggleCalendar(!alarm.calendarSyncEnabled)} />}
        />
        {[
          { key:'dayBeforeTodoEnabled' as const, title:'D-1 알림', desc:'여행 전날 저녁 8시에 준비물 알림 발송' },
          { key:'dayAlarmEnabled' as const,      title:'당일 알림', desc:'여행 당일 아침 7시에 체크리스트 요약 발송' },
        ].map(({ key, title, desc }) => (
          <SettingsRow key={key}
            left={<><div style={{ opacity: alarm.calendarSyncEnabled ? 1 : 0.45 }}><div style={{ fontWeight:600, fontSize:15 }}>{title}</div><div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{alarm.calendarSyncEnabled ? desc : '톡캘린더 등록을 켜면 사용할 수 있어요'}</div></div></>}
            right={<Toggle active={alarm.calendarSyncEnabled && alarm[key]} disabled={!alarm.calendarSyncEnabled} onChange={() => toggleAlarm(key, !alarm[key])} />}
          />
        ))}
      </SettingsSection>
      </>
      )}

      <SettingsSection title="앱 정보" px={px}>
        {[
          { label:'버전', value:'1.0.0 (beta)' },
          { label:'오픈소스 라이선스', value:'›' },
          { label:'개인정보 처리방침', value:'›' },
          { label:'이용약관', value:'›' },
        ].map(({ label, value }) => (
          <SettingsRow key={label}
            left={<span style={{ fontSize:15 }}>{label}</span>}
            right={<span style={{ fontSize:14, color:'var(--text2)' }}>{value}</span>}
          />
        ))}
      </SettingsSection>

      <div style={{ paddingTop:0, paddingRight:px, paddingBottom:0, paddingLeft:px, marginBottom:24 }}>
        <div style={{ background:'var(--tag-bg)', borderRadius:14, padding:'12px 16px' }}>
          <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.7 }}>
            📊 생태관광지 데이터: 한국관광공사 TourAPI<br />
            ♿ 무장애 여행정보: 한국관광공사 무장애 여행정보<br />
            🌿 축제 정보: 문화체육관광부 축제정보 서비스
          </div>
        </div>
      </div>

      <div style={{ paddingTop:0, paddingRight:px, paddingBottom:20, paddingLeft:px }}>
        <button onClick={() => setConfirmLogout(true)} style={{ width:'100%', padding:'13px 0', borderRadius:14, border:'1.5px solid #F0D0D0', color:'#E57373', fontWeight:700, fontSize:15, cursor:'pointer' }}>
          로그아웃
        </button>
      </div>

      {editingChild !== null && (
        <Modal onClose={() => setEditingChild(null)}>
          <EditChildModal
            child={toChildInput(children[editingChild] ?? { id:'', name:'', birth:'' })}
            onSave={updated => {
              const next = children.map(toChildInput);
              next[editingChild] = updated;
              saveChildren(next);
              setEditingChild(null);
            }}
            onClose={() => setEditingChild(null)}
          />
        </Modal>
      )}

      {addingChild && (
        <Modal onClose={() => setAddingChild(false)}>
          <EditChildModal
            title="아이 추가"
            child={{ name:'', birth:'' }}
            onSave={added => {
              saveChildren([...children.map(toChildInput), added]);
              setAddingChild(false);
            }}
            onClose={() => setAddingChild(false)}
          />
        </Modal>
      )}

      {deletingChild !== null && (
        <Modal onClose={() => setDeletingChild(null)}>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>아이 정보를 삭제할까요?</div>
          <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6, marginBottom:20 }}>
            {children[deletingChild]?.name || `아이 ${deletingChild+1}`} 정보가 삭제돼요.
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setDeletingChild(null)} style={{ flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid var(--border)', fontSize:14, fontWeight:600, color:'var(--text2)', cursor:'pointer' }}>취소</button>
            <button onClick={() => { removeChild(deletingChild); setDeletingChild(null); }} style={{ flex:2, padding:'12px 0', borderRadius:12, border:'none', background:'#E57373', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>삭제</button>
          </div>
        </Modal>
      )}

      {confirmLogout && (
        <Modal onClose={() => setConfirmLogout(false)}>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>로그아웃 할까요?</div>
          <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6, marginBottom:20 }}>
            다시 이용하려면 카카오로 로그인해야 해요.
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setConfirmLogout(false)} style={{ flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid var(--border)', fontSize:14, fontWeight:600, color:'var(--text2)', cursor:'pointer' }}>취소</button>
            <button onClick={() => { clearTokens(); setConfirmLogout(false); }} style={{ flex:2, padding:'12px 0', borderRadius:12, border:'none', background:'#E57373', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>로그아웃</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
