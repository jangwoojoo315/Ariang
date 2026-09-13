/**
 * 주소 앞머리(시도)를 다트 지도 위 좌표로 옮기는 표.
 *
 * 지도(`ui/dart.tsx`의 KOREA_D)는 정확한 도법이 아니라 손으로 그린 실루엣이라
 * 좌표도 시도 중심의 위경도를 지도 범위(x 56~242, y 36~288)에 선형 투영한 근삿값이다.
 * 제주는 본토와 떨어진 별도 타원(cx 118, cy 344) 위에 찍는다.
 */
export interface RegionPoint {
  /** 카드에 노출할 짧은 지역명 */
  label: string;
  /** addr1 첫 토큰이 이 중 하나로 시작하면 매칭 (예: "충청북도", "충북") */
  aliases: string[];
  x: number;
  y: number;
}

export const REGION_POINTS: RegionPoint[] = [
  { label: "서울", aliases: ["서울"], x: 109, y: 98 },
  { label: "인천", aliases: ["인천"], x: 96, y: 104 },
  { label: "경기", aliases: ["경기"], x: 135, y: 107 },
  { label: "강원", aliases: ["강원"], x: 169, y: 85 },
  { label: "충북", aliases: ["충청북", "충북"], x: 144, y: 140 },
  { label: "세종", aliases: ["세종"], x: 124, y: 158 },
  { label: "충남", aliases: ["충청남", "충남"], x: 100, y: 154 },
  { label: "대전", aliases: ["대전"], x: 128, y: 165 },
  { label: "경북", aliases: ["경상북", "경북"], x: 203, y: 162 },
  { label: "대구", aliases: ["대구"], x: 188, y: 191 },
  { label: "전북", aliases: ["전라북", "전북"], x: 117, y: 199 },
  { label: "울산", aliases: ["울산"], x: 223, y: 209 },
  { label: "경남", aliases: ["경상남", "경남"], x: 174, y: 222 },
  { label: "부산", aliases: ["부산"], x: 212, y: 229 },
  { label: "광주", aliases: ["광주"], x: 103, y: 230 },
  { label: "전남", aliases: ["전라남", "전남"], x: 109, y: 246 },
  { label: "제주", aliases: ["제주"], x: 118, y: 344 },
];

/** 시도를 알아내지 못했을 때 꽂을 자리 (지도 한가운데 내륙) */
const FALLBACK: RegionPoint = { label: "대한민국", aliases: [], x: 150, y: 170 };

/**
 * "강원특별자치도 속초시 영금정로 24" → 강원 좌표.
 * 첫 토큰만 보므로 도로명·지번 어느 형식이든 동작한다.
 */
export function resolveRegionPoint(addr1: string | null | undefined): RegionPoint {
  const head = (addr1 ?? "").trim().split(/\s+/)[0] ?? "";
  if (!head) return FALLBACK;
  return (
    REGION_POINTS.find((r) => r.aliases.some((a) => head.startsWith(a))) ?? FALLBACK
  );
}
