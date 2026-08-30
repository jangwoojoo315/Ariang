'use client';
import { createContext, useContext } from 'react';
import type { SpotOrFestival, Bundle } from '@/shared/types';

// 탭 레이아웃이 페이지들에 내려주는 공유 액션/상태.
// (상세 시트 열기·여행 저장 등은 여러 탭에서 쓰이므로 레이아웃에 두고 컨텍스트로 공유)
export interface TabsContextValue {
  onSelectItem: (item: SpotOrFestival) => void;
  onSelectBundle: (bundle: Bundle) => void;
  onSaveTrip: (
    item: SpotOrFestival,
    date: string,
    useRecommendedItems?: boolean,
  ) => Promise<boolean>;
  savedTrips: { itemId: string }[];
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({
  value,
  children,
}: {
  value: TabsContextValue;
  children: React.ReactNode;
}) {
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within the tabs layout');
  return ctx;
}
