import { Region } from '@/shared/api/generated/model';
import type { MyTour } from '@/shared/api/generated/model';

// 내 여행 목데이터 (한국 관광지 기반). /api/my-tour
// tourInfo는 탐색/홈의 TourSpot과 동일 구조.
// 정렬: visitDate 미정(null) → 최신 날짜순 (명세 비고 참고)
export const myTourListMock: MyTour[] = [
  {
    id: 'mt-1001',
    visitDate: '2026-09-12',
    tourInfo: {
      id: '126508',
      name: '경복궁',
      region: Region.SEOUL,
      imgUrl:
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
      isStrollerRental: true,
      isPark: true,
      isToilet: true,
      operatingHours: '09:00~18:00 (화요일 휴궁)',
      price: '성인 3,000원',
      latitude: 37.5796,
      longitude: 126.977,
    },
    checklist: [
      { id: 'chk-1', checked: true, text: '유아차' },
      { id: 'chk-2', checked: false, text: '여벌 옷' },
      { id: 'chk-3', checked: false, text: '간식·물' },
    ],
  },
  {
    id: 'mt-1002',
    visitDate: '2026-08-30',
    tourInfo: {
      id: '125266',
      name: '설악산 국립공원',
      region: Region.GANGWON,
      imgUrl:
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80',
      isStrollerRental: false,
      isPark: true,
      isToilet: true,
      operatingHours: '상시 개방 (탐방로별 상이)',
      price: '무료',
      latitude: 38.1197,
      longitude: 128.4655,
    },
    checklist: [
      { id: 'chk-1', checked: false, text: '등산화' },
      { id: 'chk-2', checked: false, text: '아기띠' },
    ],
  },
  {
    id: 'mt-1003',
    visitDate: null,
    tourInfo: {
      id: '127581',
      name: '한라산 국립공원',
      region: Region.JEJU,
      imgUrl:
        'https://images.unsplash.com/photo-1546484959-f9a381d1330d?w=600&q=80',
      isStrollerRental: false,
      isPark: true,
      isToilet: true,
      operatingHours: '탐방 예약제 운영',
      price: '무료',
      latitude: 33.3617,
      longitude: 126.5292,
    },
    checklist: [{ id: 'chk-1', checked: false, text: '탐방 예약 확인' }],
  },
];
