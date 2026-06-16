export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
export type Theme = 'forest' | 'wetland' | 'ocean' | 'farm' | 'wildlife' | 'astronomy' | 'geology';

export interface ThemeInfo {
  label: string;
  color: string;
  bg: string;
  icon: string;
}

export interface Spot {
  id: number;
  name: string;
  region: string;
  theme: Theme;
  img: string;
  description: string;
  stroller: boolean;
  nursing: boolean;
  parking: boolean;
  accessible: boolean;
  hasPrograms: boolean;
  programs: string[];
  season: Season[];
  rating: number;
  reviews: number;
  rank?: number;
  hours: string;
  admission: string;
  restaurant?: string;
  safety?: string;
  isNew: boolean;
  distance: number;
  dateRange?: never;
}

export interface Festival {
  id: number;
  name: string;
  region: string;
  theme: Theme;
  img: string;
  description: string;
  stroller: boolean;
  nursing: boolean;
  parking: boolean;
  accessible: boolean;
  hasPrograms: boolean;
  programs: string[];
  dateRange: string;
  rating: number;
  reviews: number;
  rank?: number;
  season: Season[];
  isNew: boolean;
  distance: number;
  admission: string;
  hours?: string;
  restaurant?: string;
  safety?: string;
}

export type SpotOrFestival = Spot | Festival;

export interface CourseStop {
  type: 'spot' | 'festival' | 'meal' | 'stay';
  item?: SpotOrFestival;
  order: number;
  tip?: string;
  label?: string;
  icon?: string;
  desc?: string;
}

export interface Bundle {
  id: string | number;
  title: string;
  theme: Theme;
  distance: string;
  duration: string;
  stroller: boolean;
  region: string;
  description: string;
  course: CourseStop[];
}

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

export interface Trip {
  id: number;
  itemId: number;
  item: SpotOrFestival;
  date: string;
  checklist: ChecklistItem[];
}

export interface ChildProfile {
  name: string;
  birth: string;
}

export interface UserProfile {
  children: ChildProfile[];
}

export interface FilterState {
  regions: string[];
  themes: Theme[];
  stroller: boolean;
  nursing: boolean;
  parking: boolean;
  accessible: boolean;
  hasPrograms: boolean;
  season: Season | '';
}
