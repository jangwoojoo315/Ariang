'use client';
import { useState } from 'react';
import { Modal, PrimaryBtn } from '@/shared/ui';
import { useWindowWidth } from '@/shared/lib';
import type { UserProfile, ChildProfile } from '@/shared/types';

interface Props { user: UserProfile | null; onUpdateUser: (u: UserProfile) => void; }

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width:46, height:26, borderRadius:13, background: active ? 'var(--primary)' : '#D0D0D0', position:'relative', transition:'background 0.2s', flexShrink:0, border:'none', cursor:'pointer' }}>
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
    <div style={{ padding:`0 ${px}px`, marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:8, letterSpacing:0.5 }}>{title}</div>
      <SettingsCard>{children}</SettingsCard>
    </div>
  );
}

function EditChildModal({ child, onSave, onClose }: { child: ChildProfile; onSave:(c:ChildProfile)=>void; onClose:()=>void }) {
  const [form, setForm] = useState(child);
  return (
    <>
      <div style={{ fontWeight:800, fontSize:18, marginBottom:18 }}>아이 정보 편집</div>
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

export function SettingsScreen({ user, onUpdateUser }: Props) {
  const [notif, setNotif] = useState({ dMinus1:true, dayOf:true, marketing:false });
  const [editingChild, setEditingChild] = useState<number|null>(null);
  const [now] = useState(() => Date.now());
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  return (
    <div style={{ height:'100%', overflowY:'auto', paddingBottom: isMobile ? 80 : 24 }} className="no-scroll">
      <div style={{ padding:`24px ${px}px 0` }}>
        <div style={{ fontWeight:800, fontSize:22, marginBottom:20 }}>설정 ⚙️</div>
      </div>

      <div style={{ padding:`0 ${px}px`, marginBottom:8 }}>
        <SettingsCard>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'4px 0 12px' }}>
            <div style={{ width:56, height:56, borderRadius:28, background:'linear-gradient(135deg, var(--primary), var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🌿</div>
            <div>
              <div style={{ fontWeight:800, fontSize:17 }}>자연 사랑 부모님</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>카카오로 로그인 중</div>
            </div>
          </div>
        </SettingsCard>
      </div>

      <SettingsSection title="👶 아이 프로필" px={px}>
        {(user?.children || []).map((child, i) => (
          <SettingsRow key={i}
            left={<>
              <div style={{ width:36, height:36, borderRadius:18, background:'var(--tag-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🧒</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{child.name || `아이 ${i+1}`}</div>
                {child.birth && <div style={{ fontSize:12, color:'var(--text2)', marginTop:1 }}>{getAge(child.birth, now)} ({child.birth})</div>}
              </div>
            </>}
            right={<button onClick={() => setEditingChild(i)} style={{ color:'var(--primary)', fontSize:13, fontWeight:600 }}>편집</button>}
          />
        ))}
        <button style={{ width:'100%', border:'2px dashed var(--border)', borderRadius:12, padding:'11px 0', color:'var(--primary)', fontWeight:600, fontSize:14, marginTop:4, cursor:'pointer' }}
          onClick={() => onUpdateUser({ ...user, children:[...(user?.children||[]),{name:'',birth:''}] })}>
          + 아이 추가
        </button>
      </SettingsSection>

      <SettingsSection title="🔔 알림 설정" px={px}>
        {[
          { key:'dMinus1' as const, title:'D-1 알림', desc:'여행 전날 저녁 8시에 준비물 알림 발송' },
          { key:'dayOf' as const,   title:'당일 알림', desc:'여행 당일 아침 7시에 체크리스트 요약 발송' },
          { key:'marketing' as const, title:'추천 알림', desc:'새로운 생태관광지 및 축제 소식 받기' },
        ].map(({ key, title, desc }) => (
          <SettingsRow key={key}
            left={<><div><div style={{ fontWeight:600, fontSize:15 }}>{title}</div><div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{desc}</div></div></>}
            right={<Toggle active={notif[key]} onChange={() => setNotif(n=>({...n,[key]:!n[key]}))} />}
          />
        ))}
      </SettingsSection>

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

      <div style={{ padding:`0 ${px}px`, marginBottom:24 }}>
        <div style={{ background:'var(--tag-bg)', borderRadius:14, padding:'12px 16px' }}>
          <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.7 }}>
            📊 생태관광지 데이터: 한국관광공사 TourAPI<br />
            ♿ 무장애 여행정보: 한국관광공사 무장애 여행정보<br />
            🌿 축제 정보: 문화체육관광부 축제정보 서비스
          </div>
        </div>
      </div>

      <div style={{ padding:`0 ${px}px`, paddingBottom:20 }}>
        <button style={{ width:'100%', padding:'13px 0', borderRadius:14, border:'1.5px solid #F0D0D0', color:'#E57373', fontWeight:700, fontSize:15, cursor:'pointer' }}>
          로그아웃
        </button>
      </div>

      {editingChild !== null && (
        <Modal onClose={() => setEditingChild(null)}>
          <EditChildModal
            child={(user?.children||[])[editingChild] || {name:'',birth:''}}
            onSave={updated => {
              const children = [...(user?.children||[])];
              children[editingChild] = updated;
              onUpdateUser({...user, children});
              setEditingChild(null);
            }}
            onClose={() => setEditingChild(null)}
          />
        </Modal>
      )}
    </div>
  );
}
