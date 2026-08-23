"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { registerMyTourCalendar } from "@/shared/api/generated/calendar/calendar";
import { getGetMyTourListQueryKey } from "@/shared/api/generated/my-tour/my-tour";
import { PENDING_CALENDAR_TOUR_ID } from "@/shared/lib";

const IS_DEV = process.env.NODE_ENV === "development";

// 톡캘린더 동의 후 백엔드가 리다이렉트하는 콜백 페이지.
// 쿼리스트링(?calendarLinked=true | ?error=...)을 읽고, 성공이면 동의 전에
// 저장해둔 항목에 대해 캘린더 등록을 재호출한 뒤 내 여행으로 이동한다. UI 없음.
export default function CalendarCallbackPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("calendarLinked");
    const error = params.get("error");
    const pendingId = sessionStorage.getItem(PENDING_CALENDAR_TOUR_ID);
    sessionStorage.removeItem(PENDING_CALENDAR_TOUR_ID);

    (async () => {
      if (linked === "true" && pendingId) {
        try {
          await registerMyTourCalendar(
            Number(pendingId),
            IS_DEV ? { dev: true } : undefined,
          );
          queryClient.invalidateQueries({
            queryKey: getGetMyTourListQueryKey(),
          });
        } catch (e) {
          console.warn("톡캘린더 등록 재시도 실패:", e);
        }
      } else if (error) {
        console.warn("톡캘린더 동의 실패:", error);
      }
      router.replace("/trips");
    })();
  }, [router, queryClient]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text2)",
        fontSize: 14,
      }}
    >
      톡캘린더 연동 중…
    </div>
  );
}
