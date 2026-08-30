"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DetailSheet, BundleDetailSheet } from "@/views/detail";
import { LoginScreen } from "@/views/auth";
import { Modal, PrimaryBtn } from "@/shared/ui";
import { useWindowWidth, useIsAuthenticated } from "@/shared/lib";
import {
  useGetMyTourList,
  createMyTour,
  getGetMyTourListQueryKey,
} from "@/shared/api/generated/my-tour/my-tour";
import { useGetUserInfo } from "@/shared/api/generated/user/user";
import type { SpotOrFestival, Bundle } from "@/shared/types";
import { TabsProvider } from "./tabs-context";

const NAV = [
  { path: "/", label: "홈" },
  { path: "/search", label: "검색" },
  { path: "/trips", label: "내 여행" },
  { path: "/settings", label: "설정" },
];

// 로그인이 필요한 경로 (미로그인 시 로그인 게이트 노출)
const GATED_PATHS = ["/trips", "/settings"];

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [selectedItem, setSelectedItem] = useState<SpotOrFestival | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loginNeeded, setLoginNeeded] = useState(false);

  const isLoggedIn = useIsAuthenticated();
  const width = useWindowWidth();
  const isDesktop = width >= 768;

  // 내 여행 목록(실 API)이 저장 여부·배지 카운트의 단일 소스.
  const queryClient = useQueryClient();
  const { data: myTours } = useGetMyTourList({ query: { enabled: isLoggedIn } });
  const savedTrips = (myTours ?? []).map((t) => ({ itemId: t.tourInfo.id }));
  // 상단바 자녀 칩 표시용 사용자 정보.
  const { data: userInfo } = useGetUserInfo({ query: { enabled: isLoggedIn } });

  // 로그인 안내 후 로그인 페이지(게이트)로 이동
  const goLogin = () => {
    setLoginNeeded(false);
    setSelectedItem(null);
    setSelectedBundle(null);
    router.push("/trips");
  };

  // 저장 성공 여부를 반환 → 호출부(상세 시트)가 성공 시에만 닫도록 함.
  const handleSaveTrip = async (
    item: SpotOrFestival,
    date: string,
    useRecommendedItems = false,
  ): Promise<boolean> => {
    // 카카오 로그인 필요 기능 — 미로그인 시 안내 후 로그인 페이지로
    if (!isLoggedIn) {
      setLoginNeeded(true);
      return false;
    }
    try {
      // 캘린더 등록은 백엔드가 이 요청 처리 시 자동으로 수행한다.
      await createMyTour({
        tourId: item.id,
        visitDate: date || null,
        useRecommendedItems,
      });
      queryClient.invalidateQueries({ queryKey: getGetMyTourListQueryKey() });
      router.push("/trips");
      return true;
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(message ?? "여행지 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      return false;
    }
  };

  const showLogin = GATED_PATHS.includes(pathname) && !isLoggedIn;

  return (
    <TabsProvider
      value={{
        onSelectItem: setSelectedItem,
        onSelectBundle: setSelectedBundle,
        onSaveTrip: handleSaveTrip,
        savedTrips,
      }}
    >
      <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
        {/* Desktop Sidebar */}
        {isDesktop && (
          <div
            style={{
              width: "var(--sidebar-w)",
              flexShrink: 0,
              background: "var(--surface)",
              borderRight: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 28 }}>🌿</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--logo)", letterSpacing: -0.5 }}>
                    아이랑
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>가족 생태여행</div>
                </div>
              </div>
            </div>
            <nav style={{ flex: 1, padding: "16px 12px" }}>
              {NAV.map((n) => {
                const active = pathname === n.path;
                return (
                  <button
                    key={n.path}
                    onClick={() => router.push(n.path)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      marginBottom: 4,
                      background: active ? "var(--tag-bg)" : "transparent",
                      color: active ? "var(--primary)" : "var(--text2)",
                      fontWeight: active ? 700 : 500,
                      fontSize: 15,
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <span>{n.label}</span>
                    {n.path === "/trips" && savedTrips.length > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "var(--accent)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 10,
                          padding: "2px 7px",
                        }}
                      >
                        {savedTrips.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          {/* Mobile top bar */}
          {!isDesktop && (
            <div
              style={{
                background: "var(--surface)",
                padding: "14px 16px 12px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>🌿</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "var(--logo)" }}>아이랑</span>
              </div>
              {userInfo?.children?.[0] && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--tag-bg)",
                    padding: "5px 10px",
                    borderRadius: 20,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🧒</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
                    {userInfo.children[0].name || "아이"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Screen content (route별 page 또는 로그인 게이트) */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {showLogin ? <LoginScreen /> : children}
          </div>

          {/* Mobile bottom nav */}
          {!isDesktop && (
            <div
              style={{
                display: "flex",
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                flexShrink: 0,
                zIndex: 100,
              }}
            >
              {NAV.map((n) => {
                const active = pathname === n.path;
                return (
                  <button
                    key={n.path}
                    onClick={() => router.push(n.path)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 0 8px",
                      gap: 3,
                      position: "relative",
                      color: active ? "var(--primary)" : "var(--text3)",
                      transition: "color 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{n.label}</span>
                    {n.path === "/trips" && savedTrips.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: "calc(50% - 16px)",
                          width: 16,
                          height: 16,
                          background: "var(--accent)",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>
                          {savedTrips.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail sheet */}
        {selectedItem && (
          <DetailSheet
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSaveTrip={handleSaveTrip}
          />
        )}

        {/* 여행지 저장 실패(중복 담기 등) 알림 */}
        {saveError && (
          <Modal onClose={() => setSaveError(null)}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>알림</div>
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20 }}>
              {saveError}
            </div>
            <PrimaryBtn onClick={() => setSaveError(null)}>확인</PrimaryBtn>
          </Modal>
        )}

        {/* 로그인 필요 안내 */}
        {loginNeeded && (
          <Modal onClose={() => setLoginNeeded(false)}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>로그인이 필요해요</div>
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20 }}>
              카카오 로그인이 필요한 기능입니다. 로그인 페이지로 이동합니다.
            </div>
            <PrimaryBtn onClick={goLogin}>로그인하러 가기</PrimaryBtn>
          </Modal>
        )}

        {/* Bundle detail sheet */}
        {selectedBundle && (
          <BundleDetailSheet
            bundle={selectedBundle}
            onClose={() => setSelectedBundle(null)}
            onSelectItem={(item) => {
              setSelectedBundle(null);
              setSelectedItem(item);
            }}
            onSaveTrip={handleSaveTrip}
            savedTrips={savedTrips}
          />
        )}
      </div>
    </TabsProvider>
  );
}
