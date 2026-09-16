export type Season = "spring" | "summer" | "fall" | "winter" | "year-round";
export type Theme =
  | "forest"
  | "wetland"
  | "ocean"
  | "farm"
  | "wildlife"
  | "astronomy"
  | "geology";

export interface Spot {
  id: string;
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
  latitude?: number;
  longitude?: number;
  dateRange?: never;
}

export type SpotOrFestival = Spot;

export interface FilterState {
  regions: string[];
  groups: string[];
  stroller: boolean;
  nursing: boolean;
  parking: boolean;
  accessible: boolean;
  types: string[];
}
