'use client';
import { useState, useEffect } from 'react';
import { PrimaryBtn } from '@/shared/ui';
import type { UserProfile } from '@/shared/types';

interface Props { onComplete: (profile: UserProfile) => void; }

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<'splash' | 'login' | 'child'>('splash');
  const [children, setChildren] = useState([{ name: '', birth: '' }]);

  useEffect(() => {
    if (step === 'splash') {
      const t = setTimeout(() => setStep('login'), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (step === 'splash') return (
    <div style={{ height:'100vh', width:'100vw', background:'var(--primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:72 }}>🌿</div>
      <div style={{ color:'#fff', fontSize:32, fontWeight:800, letterSpacing:-1 }}>아이랑</div>
      <div style={{ color:'rgba(255,255,255,0.75)', fontSize:15 }}>가족 생태여행 파트너</div>
      <div style={{ position:'absolute', bottom:40, display:'flex', gap:6 }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:3, background: i===0 ? '#fff' : 'rgba(255,255,255,0.3)', animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*0.2}s` }} />
        ))}
      </div>
    </div>
  );

  if (step === 'login') return (
    <div style={{ height:'100vh', width:'100vw', background:'var(--bg)', display:'flex', flexDirection:'column', padding:'0 28px' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
        <div style={{ fontSize:56 }}>🌿</div>
        <div style={{ fontWeight:800, fontSize:28, letterSpacing:-1, color:'var(--logo)' }}>아이랑</div>
        <div style={{ color:'var(--text2)', fontSize:14, textAlign:'center', lineHeight:1.6, marginTop:4 }}>
          아이와 함께하는<br />생태여행을 시작해요
        </div>
      </div>
      <div style={{ paddingBottom:48, display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ textAlign:'center', color:'var(--text2)', fontSize:13, marginBottom:4 }}>SNS 계정으로 시작하기</div>
        {[
          { name:'카카오로 시작', bg:'#FEE500', color:'#3C1E1E', icon:'💬' },
          { name:'네이버로 시작', bg:'#03C75A', color:'#fff', icon:'N' },
          { name:'Google로 시작', bg:'#fff', color:'#3C4043', icon:'G', border:'1.5px solid #DADCE0' },
        ].map(btn => (
          <button key={btn.name} onClick={() => setStep('child')} style={{
            background:btn.bg, color:btn.color, border: (btn as typeof btn & { border?: string }).border || 'none',
            borderRadius:14, padding:'15px 0', fontWeight:700, fontSize:15,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform=''}
          >
            <span style={{ fontSize:18 }}>{btn.icon}</span>{btn.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height:'100vh', width:'100vw', background:'var(--bg)', display:'flex', flexDirection:'column', padding:'0 24px' }}>
      <div style={{ paddingTop:60, paddingBottom:24 }}>
        <div style={{ fontWeight:800, fontSize:24, lineHeight:1.3, marginBottom:8 }}>아이 정보를 알려주세요 👶</div>
        <div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>아이 나이에 맞는 여행지를 추천해드려요.</div>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        {children.map((child, i) => (
          <div key={i} style={{ background:'var(--surface)', borderRadius:16, padding:18, marginBottom:12, boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:'var(--primary)' }}>아이 {i+1}</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:5, fontWeight:600 }}>이름 (선택)</div>
              <input value={child.name} onChange={e => setChildren(cs => cs.map((c,j) => j===i ? {...c,name:e.target.value} : c))}
                placeholder="예: 민준" style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', fontSize:14, background:'#fff' }} />
            </div>
            <div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:5, fontWeight:600 }}>생년월일</div>
              <input type="date" value={child.birth} onChange={e => setChildren(cs => cs.map((c,j) => j===i ? {...c,birth:e.target.value} : c))}
                style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', fontSize:14, background:'#fff' }} />
            </div>
          </div>
        ))}
        <button onClick={() => setChildren(cs => [...cs, {name:'',birth:''}])} style={{ width:'100%', border:'2px dashed var(--border)', borderRadius:14, padding:'13px 0', color:'var(--primary)', fontWeight:600, fontSize:14 }}>
          + 아이 추가
        </button>
      </div>
      <div style={{ paddingBottom:40, paddingTop:16 }}>
        <PrimaryBtn onClick={() => onComplete({ children })}>시작하기 🌿</PrimaryBtn>
      </div>
    </div>
  );
}
