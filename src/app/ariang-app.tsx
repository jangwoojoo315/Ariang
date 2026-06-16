'use client';
import { useState } from 'react';
import { HomeScreen } from '@/views/home';
import { SearchScreen } from '@/views/search';
import { DetailSheet, BundleDetailSheet } from '@/views/detail';
import { TripsScreen } from '@/views/trips';
import { SettingsScreen } from '@/views/settings';
import { BundleMakerScreen } from '@/views/bundle-maker';
import { useWindowWidth } from '@/shared/lib';
import { DEFAULT_CHECKLISTS } from '@/entities/spot';
import type { SpotOrFestival, Bundle, Trip, UserProfile } from '@/shared/types';

type Screen = 'home' | 'search' | 'bundle' | 'trips' | 'settings';

const NAV = [
  { key:'home'     as Screen, label:'홈' },
  { key:'search'   as Screen, label:'탐색' },
  { key:'bundle'   as Screen, label:'번들 만들기' },
  { key:'trips'    as Screen, label:'내 여행' },
  { key:'settings' as Screen, label:'설정' },
];


export function AriangApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedItem, setSelectedItem] = useState<SpotOrFestival | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const width = useWindowWidth();
  const isDesktop = width >= 768;

const handleSaveTrip = (item: SpotOrFestival, date: string) => {
    const defaultItems = (DEFAULT_CHECKLISTS[item.theme] || DEFAULT_CHECKLISTS.forest).map(label => ({ label, checked: false }));
    const trip: Trip = { id: Date.now(), itemId: item.id, item, date, checklist: defaultItems };
    setSavedTrips(ts => [...ts, trip]);
    setScreen('trips');
  };

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden' }}>

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ width:'var(--sidebar-w)', flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'28px 24px 20px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:28 }}>🌿</div>
              <div>
                <div style={{ fontWeight:800, fontSize:20, color:'var(--logo)', letterSpacing:-0.5 }}>아이랑</div>
                <div style={{ fontSize:11, color:'var(--text2)' }}>가족 생태여행</div>
              </div>
            </div>
          </div>
          <nav style={{ flex:1, padding:'16px 12px' }}>
            {NAV.map(n => (
              <button key={n.key} onClick={() => setScreen(n.key)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:12,
                padding:'12px 14px', borderRadius:14, marginBottom:4,
                background: screen===n.key ? 'var(--tag-bg)' : 'transparent',
                color: screen===n.key ? 'var(--primary)' : 'var(--text2)',
                fontWeight: screen===n.key ? 700 : 500, fontSize:15,
                transition:'all 0.15s', textAlign:'left',
              }}>
                <span>{n.label}</span>
                {n.key === 'trips' && savedTrips.length > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:700, borderRadius:10, padding:'2px 7px' }}>{savedTrips.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, position:'relative' }}>

        {/* Mobile top bar */}
        {!isDesktop && (
          <div style={{ background:'var(--surface)', padding:'14px 16px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:22 }}>🌿</span>
              <span style={{ fontWeight:800, fontSize:20, color:'var(--logo)' }}>아이랑</span>
            </div>
            {user?.children?.[0] && (
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--tag-bg)', padding:'5px 10px', borderRadius:20 }}>
                <span style={{ fontSize:14 }}>🧒</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)' }}>{user.children[0].name || '아이'}</span>
              </div>
            )}
          </div>
        )}

        {/* Screen content */}
        <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
          <div style={{ display: screen==='home'     ? 'block' : 'none', height:'100%' }}>
            <HomeScreen onSelectItem={setSelectedItem} onSelectBundle={setSelectedBundle} onAddTrip={handleSaveTrip} savedTrips={savedTrips} />
          </div>
          <div style={{ display: screen==='search'   ? 'block' : 'none', height:'100%' }}>
            <SearchScreen onSelectItem={setSelectedItem} />
          </div>
          <div style={{ display: screen==='bundle'   ? 'block' : 'none', height:'100%' }}>
            <BundleMakerScreen onSelectBundle={setSelectedBundle} onSelectItem={setSelectedItem} savedTrips={savedTrips} onSaveTrip={handleSaveTrip} />
          </div>
          <div style={{ display: screen==='trips'    ? 'block' : 'none', height:'100%' }}>
            <TripsScreen
              savedTrips={savedTrips}
              onUpdateChecklist={(id, items) => setSavedTrips(ts => ts.map(t => t.id===id ? {...t,checklist:items} : t))}
              onDeleteTrip={id => setSavedTrips(ts => ts.filter(t => t.id!==id))}
              onSelectItem={setSelectedItem}
              onUpdateDate={(id, date) => setSavedTrips(ts => ts.map(t => t.id===id ? {...t,date} : t))}
            />
          </div>
          <div style={{ display: screen==='settings' ? 'block' : 'none', height:'100%' }}>
            <SettingsScreen user={user} onUpdateUser={setUser} />
          </div>
        </div>

        {/* Mobile bottom nav */}
        {!isDesktop && (
          <div style={{ display:'flex', background:'var(--surface)', borderTop:'1px solid var(--border)', paddingBottom:'env(safe-area-inset-bottom, 0px)', flexShrink:0, zIndex:100 }}>
            {NAV.map(n => (
              <button key={n.key} onClick={() => setScreen(n.key)} style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'10px 0 8px', gap:3, position:'relative',
                color: screen===n.key ? 'var(--primary)' : 'var(--text3)',
                transition:'color 0.15s',
              }}>
                <span style={{ fontSize:13, fontWeight: screen===n.key ? 700 : 500 }}>{n.label}</span>
                {n.key === 'trips' && savedTrips.length > 0 && (
                  <div style={{ position:'absolute', top:8, right:'calc(50% - 16px)', width:16, height:16, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:9, color:'#fff', fontWeight:800 }}>{savedTrips.length}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      {selectedItem && (
        <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} onSaveTrip={handleSaveTrip} savedTrips={savedTrips} />
      )}

      {/* Bundle detail sheet */}
      {selectedBundle && (
        <BundleDetailSheet bundle={selectedBundle} onClose={() => setSelectedBundle(null)} onSelectItem={item => { setSelectedBundle(null); setSelectedItem(item); }} onSaveTrip={handleSaveTrip} savedTrips={savedTrips} />
      )}
    </div>
  );
}
