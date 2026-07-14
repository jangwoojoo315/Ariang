import { Region } from '@/shared/api/generated/model';
import type { TourSpot, RecentPlace } from '@/shared/api/generated/model';

// 홈 화면 목데이터 (한국 관광지 기반). 각 쿼리 2건씩.
// 이미지는 임의의 Unsplash URL.

// 인기 역사관광지 Top5 (/api/ecotourism)
export const historyTourMock: TourSpot[] = [
  {
    id: '126508',
    name: '경복궁',
    region: Region.SEOUL,
    imgUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    operatingHours: '09:00~18:00 (화요일 휴궁)',
    price: '성인 3,000원',
    latitude: 37.5796,
    longitude: 126.977,
  },
  {
    id: '264337',
    name: '불국사',
    region: Region.GYEONGBUK,
    imgUrl: 'https://images.unsplash.com/photo-1538485399081-7c8ce013b933?w=600&q=80',
    isStrollerRental: false,
    isPark: true,
    isToilet: true,
    operatingHours: '09:00~17:00',
    price: '성인 6,000원',
    latitude: 35.7900,
    longitude: 129.3320,
  },
];

// 인기 체험관광지 Top5 (/api/experience)
export const experienceTourMock: TourSpot[] = [
  {
    id: '128924',
    name: '한국민속촌',
    region: Region.GYEONGGI,
    imgUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80',
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    operatingHours: '10:00~18:30',
    price: '성인 32,000원 / 어린이 26,000원',
    latitude: 37.2586,
    longitude: 127.1181,
  },
  {
    id: '129507',
    name: '국립과천과학관',
    region: Region.GYEONGGI,
    imgUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80',
    isStrollerRental: true,
    isPark: false,
    isToilet: true,
    operatingHours: '09:30~17:30 (월요일 휴관)',
    price: '성인 4,000원 / 어린이 무료',
    latitude: 37.4361,
    longitude: 126.9986,
  },
];

// 인기 자연관광지 Top5 (/api/nature)
export const natureTourMock: TourSpot[] = [
  {
    id: '125266',
    name: '설악산 국립공원',
    region: Region.GANGWON,
    imgUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80',
    isStrollerRental: false,
    isPark: true,
    isToilet: true,
    operatingHours: '상시 개방 (탐방로별 상이)',
    price: '무료',
    latitude: 38.1197,
    longitude: 128.4655,
  },
  {
    id: '127581',
    name: '한라산 국립공원',
    region: Region.JEJU,
    imgUrl: 'https://images.unsplash.com/photo-1546484959-f9a381d1330d?w=600&q=80',
    isStrollerRental: false,
    isPark: true,
    isToilet: true,
    operatingHours: '탐방 예약제 운영',
    price: '무료',
    latitude: 33.3617,
    longitude: 126.5292,
  },
];

// 새로 생긴 곳 (/api/recently-opened) — 생태관광지 1 + 축제 1
export const recentlyOpenedMock: RecentPlace[] = [
  {
    id: '2019720',
    name: '서울식물원',
    region: Region.SEOUL,
    imgUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    isEcoTourism: true,
    operatingHours: '09:30~18:00 (월요일 휴원)',
    price: '성인 5,000원',
    latitude: 37.5695,
    longitude: 126.8347,
  },
  {
    id: '3005417',
    name: '순천만 갈대축제',
    region: Region.JEONNAM,
    imgUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
    isStrollerRental: true,
    isPark: true,
    isToilet: true,
    isEcoTourism: false,
    operatingHours: '09:00~19:00',
    price: '성인 8,000원',
    latitude: 34.8853,
    longitude: 127.5086,
    startAt: '20261016',
    endAt: '20261025',
  },
];
