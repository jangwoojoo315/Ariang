'use client';
import { useState } from 'react';
import { PlaceholderImg, ThemeChip, BottomSheet, PrimaryBtn } from '@/shared/ui';
import { IcoSearch, IcoFilter, IcoStroller, IcoMilk, IcoCar, IcoAccessible, IcoProgram, IcoFlower, IcoSunSeason, IcoFall, IcoSnow, IcoLeaf, IcoReset, IcoXClose, IcoSpark } from '@/shared/ui';
import { SPOTS, FESTIVALS, THEMES, REGIONS, SEASONS } from '@/entities/spot';
import { THEME_ICONS } from '@/shared/ui';
import { useWindowWidth } from '@/shared/lib';
import type { SpotOrFestival, FilterState, Season, Theme } from '@/shared/types';

interface Props { onSelectItem: (item: SpotOrFestival) => void; }

export function SearchScreen({ onSelectItem }: Props) {
  const [tab, setTab] = useState<'spots'|'festivals'>('spots');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ regions:[], themes:[], stroller:false, nursing:false, parking:false, accessible:false, hasPrograms:false, season:'' });
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  const items: SpotOrFestival[] = tab === 'spots' ? SPOTS : FESTIVALS;
  const activeFilterCount = [filters.regions.length>0, filters.themes.length>0, filters.stroller, filters.nursing, filters.parking, filters.accessible, filters.hasPrograms, !!filters.season].filter(Boolean).length;

  const filtered = items.filter(item => {
    if (query && !item.name.includes(query) && !item.region.includes(query)) return false;
    if (filters.regions.length && !filters.regions.includes(item.region)) return false;
    if (filters.themes.length && !filters.themes.includes(item.theme)) return false;
    if (filters.stroller && !item.stroller) return false;
    if (filters.nursing && !item.nursing) return false;
    if (filters.parking && !item.parking) return false;
    if (filters.accessible && !item.accessible) return false;
    if (filters.hasPrograms && !item.hasPrograms) return false;
    if (filters.season) { if (!('season' in item) || !item.season.includes(filters.season as Season)) return false; }
    return true;
  });

  const toggle = (key: keyof FilterState) => setFilters(f => ({ ...f, [key]: !f[key] }));
  const toggleArr = (key: 'regions'|'themes', val: string) => setFilters(f => ({
    ...f,
    [key]: (f[key] as string[]).includes(val) ? (f[key] as string[]).filter(v => v!==val) : [...(f[key] as string[]), val],
  }));
  const clearFilters = () => setFilters({ regions:[], themes:[], stroller:false, nursing:false, parking:false, accessible:false, hasPrograms:false, season:'' });

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--surface)', padding:`16px ${px}px 0`, boxShadow:'0 1px 0 var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:0, marginBottom:14 }}>
          {[['spots','생태관광지'],['festivals','축제']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key as 'spots'|'festivals')} style={{
              flex:1, padding:'8px 0', fontWeight:700, fontSize:14,
              borderBottom: tab===key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: tab===key ? 'var(--primary)' : 'var(--text2)', transition:'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:12, padding:'10px 14px', border:'1.5px solid var(--border)' }}>
            <IcoSearch size={16} color="var(--text3)" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder={tab==='spots' ? '관광지 이름, 지역 검색' : '축제 이름, 지역 검색'}
              style={{ flex:1, border:'none', background:'transparent', fontSize:14, color:'var(--text)', outline:'none' }} />
            {query && <button onClick={() => setQuery('')} style={{ color:'var(--text3)', fontSize:16 }}>×</button>}
          </div>
          <button onClick={() => setShowFilters(true)} style={{
            background: activeFilterCount>0 ? 'var(--primary)' : 'var(--bg)',
            color: activeFilterCount>0 ? '#fff' : 'var(--text2)',
            border: `1.5px solid ${activeFilterCount>0 ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius:12, padding:'0 14px', fontWeight:700, fontSize:13,
            display:'flex', alignItems:'center', gap:5, flexShrink:0,
          }}>
            <IcoFilter size={14} color={activeFilterCount>0 ? '#fff' : 'var(--text2)'} />
            <span>필터{activeFilterCount>0 ? ` (${activeFilterCount})` : ''}</span>
          </button>
        </div>
        {activeFilterCount > 0 && (
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:12 }} className="no-scroll">
            {filters.stroller && <FilterChip Icon={IcoStroller} label="유아차" onRemove={() => toggle('stroller')} />}
            {filters.nursing && <FilterChip Icon={IcoMilk} label="수유실" onRemove={() => toggle('nursing')} />}
            {filters.parking && <FilterChip Icon={IcoCar} label="주차" onRemove={() => toggle('parking')} />}
            {filters.accessible && <FilterChip Icon={IcoAccessible} label="배려화장실" onRemove={() => toggle('accessible')} />}
            {filters.hasPrograms && <FilterChip Icon={IcoProgram} label="체험프로그램" onRemove={() => toggle('hasPrograms')} />}
            {filters.season && <FilterChip label={SEASONS[filters.season as Season]} onRemove={() => setFilters(f => ({...f,season:''}))} />}
            {filters.regions.map(r => <FilterChip key={r} label={r} onRemove={() => toggleArr('regions', r)} />)}
            {filters.themes.map(t => <FilterChip key={t} label={THEMES[t as Theme]?.label} onRemove={() => toggleArr('themes', t)} />)}
            <button onClick={clearFilters} style={{ flexShrink:0, color:'var(--text2)', fontSize:12, padding:'4px 8px', background:'#F0F0F0', borderRadius:20 }}>초기화</button>
          </div>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:`16px ${px}px`, paddingBottom: isMobile ? 80 : 24 }} className="no-scroll">
        <div style={{ color:'var(--text2)', fontSize:13, marginBottom:14, fontWeight:500 }}>
          {filtered.length}개의 {tab==='spots' ? '관광지' : '축제'}를 찾았어요
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60, color:'var(--text2)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🌿</div>
            <div style={{ fontWeight:600, fontSize:16, marginBottom:6 }}>검색 결과가 없어요</div>
            <div style={{ fontSize:14 }}>필터를 조정해 보세요</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap:14 }}>
            {filtered.map(item => <SearchCard key={item.id} item={item} onClick={() => onSelectItem(item)} />)}
          </div>
        )}
      </div>

      {showFilters && (
        <FilterSheet filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} toggle={toggle} toggleArr={toggleArr} />
      )}
    </div>
  );
}

function FilterChip({ Icon, label, onRemove }: { Icon?: React.FC<{size:number;color:string}>; label: string; onRemove: () => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, background:'var(--tag-bg)', color:'var(--primary)', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20, flexShrink:0 }}>
      {Icon && <Icon size={11} color="var(--primary)" />}
      {label}
      <button onClick={onRemove} style={{ color:'var(--primary)', fontSize:14, lineHeight:1, padding:0 }}>×</button>
    </div>
  );
}

function SearchCard({ item, onClick }: { item: SpotOrFestival; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background:'var(--surface)', borderRadius:16, boxShadow:'0 2px 10px rgba(0,0,0,0.07)', overflow:'hidden', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ position:'relative' }}>
        <PlaceholderImg theme={item.theme} img={item.img} height={110} />
        {item.isNew && <div style={{ position:'absolute', top:6, right:6, background:'var(--primary)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, display:'flex', alignItems:'center', gap:3 }}>NEW <IcoSpark size={9} color="#fff" /></div>}
      </div>
      <div style={{ padding:'9px 10px 11px' }}>
        <ThemeChip theme={item.theme} small />
        <div style={{ fontWeight:700, fontSize:13, marginTop:5, marginBottom:2, lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>{item.name}</div>
        <div style={{ fontSize:11, color:'var(--text2)', marginBottom:5 }}>{item.region}{'dateRange' in item && item.dateRange ? ` · ${item.dateRange.slice(5,10)}` : ''}</div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {item.stroller && <span style={{ fontSize:10, color:'var(--primary)', background:'var(--tag-bg)', padding:'2px 6px', borderRadius:10, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}><IcoStroller size={10} color="var(--primary)" />유아차</span>}
          {item.nursing && <span style={{ fontSize:10, color:'var(--primary)', background:'var(--tag-bg)', padding:'2px 6px', borderRadius:10, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}><IcoMilk size={10} color="var(--primary)" />수유실</span>}
        </div>
      </div>
    </div>
  );
}

function ToggleChip({ Icon, label, active, onClick }: { Icon?: React.FC<{size:number;color:string}>; label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      padding:'7px 13px', borderRadius:20, fontSize:13, fontWeight:600,
      background: active ? 'var(--primary)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--text2)',
      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
      transition:'all 0.15s', display:'flex', alignItems:'center', gap:5,
    }}>
      {Icon && <Icon size={12} color={active ? '#fff' : 'var(--text2)'} />}
      {label}
    </button>
  );
}

function FilterSection({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:'var(--text2)' }}>{title}</div>
      {children}
    </div>
  );
}

function FilterSheet({ filters, setFilters, onClose, toggle, toggleArr }: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onClose: () => void;
  toggle: (key: keyof FilterState) => void;
  toggleArr: (key: 'regions'|'themes', val: string) => void;
}) {
  const clearFilters = () => setFilters({ regions:[], themes:[], stroller:false, nursing:false, parking:false, accessible:false, hasPrograms:false, season:'' });
  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:18 }}>필터</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={clearFilters} style={{ width:34, height:34, borderRadius:17, border:'1.5px solid var(--border)', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <IcoReset size={16} color="var(--text2)" />
            </button>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:17, border:'1.5px solid var(--border)', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <IcoXClose size={16} color="var(--text2)" />
            </button>
          </div>
        </div>

        <FilterSection title="육아 필수 시설">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {([['stroller',IcoStroller,'유아차 가능'],['nursing',IcoMilk,'수유실'],['parking',IcoCar,'주차장'],['accessible',IcoAccessible,'배려화장실'],['hasPrograms',IcoProgram,'체험 프로그램']] as [keyof FilterState, React.FC<{size:number;color:string}>, string][]).map(([key,Icon,label]) => (
              <ToggleChip key={key} Icon={Icon} label={label} active={filters[key] as boolean} onClick={() => toggle(key)} />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="테마">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <ToggleChip key={key} Icon={THEME_ICONS[key as Theme]} label={t.label} active={filters.themes.includes(key as Theme)} onClick={() => toggleArr('themes', key)} />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="계절">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {([['spring',IcoFlower,'봄'],['summer',IcoSunSeason,'여름'],['fall',IcoFall,'가을'],['winter',IcoSnow,'겨울'],['year-round',IcoLeaf,'연중']] as [Season, React.FC<{size:number;color:string}>, string][]).map(([key,Icon,label]) => (
              <ToggleChip key={key} Icon={Icon} label={label} active={filters.season===key} onClick={() => setFilters(f => ({...f,season:f.season===key ? '' : key}))} />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="지역">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {REGIONS.map(r => (
              <ToggleChip key={r} label={r} active={filters.regions.includes(r)} onClick={() => toggleArr('regions', r)} />
            ))}
          </div>
        </FilterSection>

        <div style={{ paddingTop:8, paddingBottom:8 }}>
          <PrimaryBtn onClick={onClose}>적용하기</PrimaryBtn>
        </div>
      </div>
    </BottomSheet>
  );
}
