import { REGION_LABELS } from '@/shared/api/region-labels';
import type { TourSpot } from '@/shared/api/generated/model';
import type { Spot, Theme } from '@/shared/types';

// API TourSpot → 로컬 Spot 형태로 변환 (기존 DetailSheet 재사용용 어댑터).
// theme/description/nursing 등 API에 없는 필드는 기본값으로 채운다.
export function mapTourSpotToSpot(t: TourSpot, theme: Theme): Spot {
  return {
    id: t.id,
    name: t.name,
    region: REGION_LABELS[t.region] ?? t.region,
    theme,
    img: t.imgUrl ?? '',
    description: '',
    stroller: t.isStrollerRental,
    nursing: false,
    parking: t.isPark,
    accessible: t.isToilet,
    hasPrograms: false,
    programs: [],
    season: [],
    rating: 0,
    reviews: 0,
    hours: t.operatingHours ?? '',
    admission: t.price ?? '',
    isNew: false,
    distance: 0,
  };
}
