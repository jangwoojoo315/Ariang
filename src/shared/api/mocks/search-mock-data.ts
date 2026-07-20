import { Region } from "@/shared/api/generated/model";
import type { TourSpot } from "@/shared/api/generated/model";
import type { SearchHistoryTourParams } from "@/shared/api/generated/model";

// 역사관광지 검색 목데이터 (한국 관광지 기반). /api/search/history
// 실제 서버처럼 query 파라미터로 필터링할 수 있도록 넉넉하게 구성.
export const historySearchMock: TourSpot[] = [
  {
    id: "126508",
    name: "경복궁",
    region: Region.SEOUL,
    imgUrl:
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    operatingHours: "09:00~18:00 (화요일 휴궁)",
    price: "성인 3,000원",
    latitude: 37.5796,
    longitude: 126.977,
  },
  {
    id: "264337",
    name: "불국사",
    region: Region.GYEONGBUK,
    imgUrl:
      "https://images.unsplash.com/photo-1538485399081-7c8ce013b933?w=600&q=80",
    isStrollerRental: false,
    isPark: true,
    isToilet: true,
    operatingHours: "09:00~17:00",
    price: "성인 6,000원",
    latitude: 35.79,
    longitude: 129.332,
  },
  {
    id: "126522",
    name: "창덕궁",
    region: Region.SEOUL,
    imgUrl:
      "https://images.unsplash.com/photo-1601621915196-2621bao?w=600&q=80",
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    operatingHours: "09:00~18:00 (월요일 휴궁)",
    price: "성인 3,000원",
    latitude: 37.5794,
    longitude: 126.991,
  },
  {
    id: "126483",
    name: "수원 화성",
    region: Region.GYEONGGI,
    imgUrl:
      "https://images.unsplash.com/photo-1583833008338-31a6657917ab?w=600&q=80",
    isStrollerRental: false,
    isPark: true,
    isToilet: true,
    operatingHours: "09:00~18:00",
    price: "성인 1,500원",
    latitude: 37.2881,
    longitude: 127.0146,
  },
  {
    id: "264350",
    name: "석굴암",
    region: Region.GYEONGBUK,
    imgUrl:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&q=80",
    isStrollerRental: false,
    isPark: false,
    isToilet: true,
    operatingHours: "09:00~17:30",
    price: "성인 6,000원",
    latitude: 35.7947,
    longitude: 129.3497,
  },
  {
    id: "133438",
    name: "부여 궁남지",
    region: Region.CHUNGNAM,
    imgUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    operatingHours: "상시 개방",
    price: "무료",
    latitude: 36.2683,
    longitude: 126.9106,
  },
];

// 요청 query 파라미터에 맞춰 목데이터를 필터링한다.
export function filterHistorySearch(url: string): TourSpot[] {
  const sp = new URL(url).searchParams;
  const params: SearchHistoryTourParams = {
    isStrollerRental: sp.has("isStrollerRental")
      ? sp.get("isStrollerRental") === "true"
      : undefined,
    isPark: sp.has("isPark") ? sp.get("isPark") === "true" : undefined,
    isToilet: sp.has("isToilet") ? sp.get("isToilet") === "true" : undefined,
    region: (sp.get("region") as Region) ?? undefined,
    tourName: sp.get("tourName") ?? undefined,
  };

  return historySearchMock.filter((spot) => {
    if (params.isStrollerRental && !spot.isStrollerRental) return false;
    if (params.isPark && !spot.isPark) return false;
    if (params.isToilet && !spot.isToilet) return false;
    if (params.region && spot.region !== params.region) return false;
    if (params.tourName && !spot.name.includes(params.tourName)) return false;
    return true;
  });
}
