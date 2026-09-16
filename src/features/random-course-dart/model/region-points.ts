import { REGION_LABELS } from "@/shared/api/region-labels";
import type { Region } from "@/shared/api/generated/model";

/**
 * 추천 코스의 지역(Region)을 다트 지도 위 좌표로 옮긴다.
 *
 * 지도(`ui/dart.tsx`의 KOREA_D)는 정확한 도법이 아니라 손으로 그린 실루엣이라
 * 좌표도 시도 중심의 위경도를 지도 범위(x 56~242, y 36~288)에 선형 투영한 근삿값이다.
 * 제주는 본토와 떨어진 별도 타원(cx 118, cy 344) 위에 찍는다.
 */
export interface RegionPoint {
  /** 카드·스탬프에 노출할 짧은 지역명 */
  label: string;
  x: number;
  y: number;
}

/** Region enum → 지도 좌표 */
export const REGION_COORDS: Record<Region, { x: number; y: number }> = {
  SEOUL: { x: 109, y: 98 },
  INCHEON: { x: 96, y: 104 },
  GYEONGGI: { x: 135, y: 107 },
  GANGWON: { x: 169, y: 85 },
  CHUNGBUK: { x: 144, y: 140 },
  SEJONG: { x: 124, y: 158 },
  CHUNGNAM: { x: 100, y: 154 },
  DAEJEON: { x: 128, y: 165 },
  GYEONGBUK: { x: 203, y: 162 },
  DAEGU: { x: 188, y: 191 },
  JEONBUK: { x: 117, y: 199 },
  ULSAN: { x: 223, y: 209 },
  GYEONGNAM: { x: 174, y: 222 },
  BUSAN: { x: 212, y: 229 },
  GWANGJU: { x: 103, y: 230 },
  JEONNAM: { x: 109, y: 246 },
  JEJU: { x: 118, y: 344 },
};

/** 지역을 알 수 없을 때 꽂을 자리 (지도 한가운데 내륙) */
const FALLBACK: RegionPoint = { label: "대한민국", x: 150, y: 170 };

/** 추천 코스의 region으로 다트가 꽂힐 자리를 정한다. */
export function resolveRegionPoint(region: Region | null | undefined): RegionPoint {
  if (!region) return FALLBACK;
  const coords = REGION_COORDS[region];
  if (!coords) return FALLBACK;
  return { label: REGION_LABELS[region] ?? FALLBACK.label, ...coords };
}
