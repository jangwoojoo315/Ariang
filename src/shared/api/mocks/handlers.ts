import type { HttpHandler } from 'msw';
import {
  getGetMyTourListMockHandler,
  getCreateMyTourMockHandler,
  getDeleteMyTourMockHandler,
  getUpdateMyTourVisitDateMockHandler,
  getUpdateChecklistMockHandler,
} from '@/shared/api/generated/my-tour/my-tour.msw';
import type {
  MyTour,
  UpdateVisitDateRequest,
  UpdateChecklistRequest,
} from '@/shared/api/generated/model';
import { myTourListMock } from './my-tour-mock-data';

// 세션 동안 상태를 유지하는 목 저장소.
// (정적 배열을 그대로 쓰면 삭제·수정이 리페치 시 되돌아가므로 가변 복제본을 둔다)
let tours: MyTour[] = myTourListMock.map((t) => ({ ...t }));

// 내 여행(MyTour) API만 목으로 처리한다.
// 홈·검색 등 나머지 요청은 등록하지 않아 실제 백엔드로 그대로 통과(bypass)된다.
export const handlers: HttpHandler[] = [
  getGetMyTourListMockHandler(() => tours),

  getCreateMyTourMockHandler(() => ({ id: `mt-${Date.now()}`, success: true })),

  getDeleteMyTourMockHandler((info) => {
    const id = String(info.params.id);
    tours = tours.filter((t) => t.id !== id);
    return { id, success: true };
  }),

  getUpdateMyTourVisitDateMockHandler(async (info) => {
    const id = String(info.params.id);
    const body = (await info.request.json()) as UpdateVisitDateRequest;
    tours = tours.map((t) =>
      t.id === id ? { ...t, visitDate: body.visitDate ?? null } : t,
    );
    return { success: true };
  }),

  getUpdateChecklistMockHandler(async (info) => {
    const id = String(info.params.id);
    const body = (await info.request.json()) as UpdateChecklistRequest;
    tours = tours.map((t) =>
      t.id === id ? { ...t, checklist: body.checklist } : t,
    );
    return { success: true };
  }),
];
