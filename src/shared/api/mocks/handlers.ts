import type { HttpHandler } from 'msw';
import {
  getGetHistoryTourTop5MockHandler,
  getGetExperienceTourTop5MockHandler,
  getGetNatureTourTop5MockHandler,
  getGetRecentlyOpenedMockHandler,
} from '@/shared/api/generated/home/home.msw';
import {
  historyTourMock,
  experienceTourMock,
  natureTourMock,
  recentlyOpenedMock,
} from './home-mock-data';

// orval이 생성한 핸들러 팩토리에 직접 만든 한국 목데이터를 주입한다
// (faker 랜덤 대신 고정 데이터. generated는 clean:true로 재생성되므로 데이터는 여기서 관리).
export const handlers: HttpHandler[] = [
  getGetHistoryTourTop5MockHandler(historyTourMock),
  getGetExperienceTourTop5MockHandler(experienceTourMock),
  getGetNatureTourTop5MockHandler(natureTourMock),
  getGetRecentlyOpenedMockHandler(recentlyOpenedMock),
];
