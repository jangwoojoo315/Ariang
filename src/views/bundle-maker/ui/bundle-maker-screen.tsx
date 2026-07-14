"use client";
import { useState, useMemo } from "react";
import { PlaceholderImg } from "@/shared/ui";
import {
  IcoRuler,
  IcoPin,
  IcoStroller,
  IcoRoute,
  IcoArrowRight,
} from "@/shared/ui";
import { SPOTS, FESTIVALS, REGIONS } from "@/entities/spot";
import { useWindowWidth } from "@/shared/lib";
import type { Bundle, SpotOrFestival } from "@/shared/types";

const SEOUL_EXAMPLE: Bundle = {
  id: "seoul-example",
  title: "서울 도심 생태 당일 코스",
  theme: "wetland",
  distance: "8.5km",
  duration: "당일치기",
  stroller: true,
  region: "서울",
  description:
    "도심 속 자연을 만끽하는 완벽한 서울 코스. 강서습지에서 철새를 관찰하고 양평 들꽃 축제로 봄을 마무리해요.",
  course: [
    {
      type: "spot",
      item: SPOTS[2],
      order: 1,
      tip: "오전 일찍 방문하면 한강 철새를 가까이서 볼 수 있어요. 유아차 탐방로 완비.",
    },
    {
      type: "meal",
      label: "점심 식사",
      icon: "🍱",
      desc: "공원 인근 한강변 카페 & 레스토랑. 어린이 메뉴 운영 중.",
      order: 2,
    },
    {
      type: "festival",
      item: FESTIVALS[0],
      order: 3,
      tip: "오후 1–4시 사이가 가장 한산해요. 압화 체험은 현장 접수.",
    },
  ],
};

interface Props {
  onSelectBundle: (bundle: Bundle) => void;
  onSelectItem: (item: SpotOrFestival) => void;
  savedTrips: { itemId: string }[];
  onSaveTrip: (item: SpotOrFestival, date: string) => void;
}

export function BundleMakerScreen({ onSelectBundle }: Props) {
  const [region, setRegion] = useState(REGIONS[0]);
  const [kind, setKind] = useState<
    "spot+festival" | "spot+spot" | "festival+festival"
  >("spot+festival");
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isWide = width >= 1200;
  const px = isMobile ? 16 : isWide ? 48 : 32;

  const KIND_OPTIONS = [
    { key: "spot+festival" as const, label: "생태관광지 + 축제" },
    { key: "spot+spot" as const, label: "생태관광지 + 생태관광지" },
    { key: "festival+festival" as const, label: "축제 + 축제" },
  ];

  const generatedBundles = useMemo<Bundle[]>(() => {
    const isSeoul = region === "서울";
    const filterRegion = <T extends { region: string }>(items: T[]) =>
      items.filter((i) => i.region === region);
    const spots = filterRegion(SPOTS);
    const festivals = filterRegion(FESTIVALS);
    const bundles: Bundle[] = [];

    if (kind === "spot+festival") {
      spots.forEach((spot) => {
        const festival =
          festivals.find((f) => f.theme === spot.theme) || festivals[0];
        if (!festival) return;
        bundles.push({
          id: `sf-${spot.id}-${festival.id}`,
          title: `${spot.name} + ${festival.name}`,
          theme: spot.theme,
          distance: `${(spot.distance + festival.distance).toFixed(1)}km`,
          duration: "당일치기",
          stroller: spot.stroller && festival.stroller,
          region:
            spot.region === festival.region
              ? spot.region
              : `${spot.region}·${festival.region}`,
          description: `${spot.name}에서 자연을 탐방하고 ${festival.name}까지 이어지는 알찬 코스예요.`,
          course: [
            {
              type: "spot",
              item: spot,
              order: 1,
              tip: "오전에 방문하면 여유롭게 즐길 수 있어요.",
            },
            {
              type: "meal",
              label: "점심 식사",
              icon: "🍱",
              desc: `${spot.region} 지역 향토 음식을 즐겨보세요.`,
              order: 2,
            },
            {
              type: "festival",
              item: festival,
              order: 3,
              tip: `${"dateRange" in festival ? festival.dateRange + " 운영" : "방문 전 일정 확인 필수"}`,
            },
          ],
        });
      });
    } else if (kind === "spot+spot") {
      for (let i = 0; i < spots.length - 1; i += 2) {
        const a = spots[i],
          b = spots[i + 1];
        if (!b) break;
        bundles.push({
          id: `ss-${a.id}-${b.id}`,
          title: `${a.name} + ${b.name}`,
          theme: a.theme,
          distance: `${(a.distance + b.distance).toFixed(1)}km`,
          duration: "1박 2일",
          stroller: a.stroller && b.stroller,
          region: a.region === b.region ? a.region : `${a.region}·${b.region}`,
          description: `${a.name}과 ${b.name}을 묶은 생태관광지 집중 탐방 코스예요.`,
          course: [
            {
              type: "spot",
              item: a,
              order: 1,
              tip: "첫 번째 관광지는 오전 일찍 방문하세요.",
            },
            {
              type: "meal",
              label: "점심 식사",
              icon: "🍱",
              desc: `${a.region} 지역 맛집에서 충전.`,
              order: 2,
            },
            {
              type: "spot",
              item: b,
              order: 3,
              tip: "두 번째 관광지는 오후에 여유롭게.",
            },
          ],
        });
      }
    } else {
      for (let i = 0; i < festivals.length - 1; i += 2) {
        const a = festivals[i],
          b = festivals[i + 1];
        if (!b) break;
        bundles.push({
          id: `ff-${a.id}-${b.id}`,
          title: `${a.name} + ${b.name}`,
          theme: a.theme,
          distance: `${(a.distance + b.distance).toFixed(1)}km`,
          duration: "당일치기",
          stroller: a.stroller && b.stroller,
          region: a.region === b.region ? a.region : `${a.region}·${b.region}`,
          description: `${a.name}과 ${b.name}을 하루에 즐기는 축제 집중 코스예요.`,
          course: [
            {
              type: "festival",
              item: a,
              order: 1,
              tip: `${"dateRange" in a ? a.dateRange : "날짜 확인 필수"}`,
            },
            {
              type: "meal",
              label: "점심 식사",
              icon: "🍱",
              desc: "축제 현장 인근 식당을 이용해보세요.",
              order: 2,
            },
            {
              type: "festival",
              item: b,
              order: 3,
              tip: `${"dateRange" in b ? b.dateRange : "날짜 확인 필수"}`,
            },
          ],
        });
      }
    }

    return [
      ...(isSeoul && kind === "spot+festival" ? [SEOUL_EXAMPLE] : []),
      ...bundles,
    ];
  }, [region, kind]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "var(--surface)",
          padding: `20px ${px}px 0`,
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
          여행 번들 만들기
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
          원하는 조합으로 나만의 코스를 만들어보세요
        </div>
        <div
          style={{
            display: "flex",
            borderRadius: 20,
            padding: 3,
            gap: 2,
            marginBottom: 14,
            background: "var(--bg)",
          }}
        >
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setKind(opt.key)}
              style={{
                flex: 1,
                padding: "7px 4px",
                borderRadius: 17,
                fontSize: isMobile ? 11 : 12,
                fontWeight: 700,
                background: kind === opt.key ? "var(--primary)" : "transparent",
                color: kind === opt.key ? "#fff" : "var(--text2)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 14,
          }}
          className="no-scroll"
        >
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: region === r ? "var(--primary)" : "var(--bg)",
                color: region === r ? "#fff" : "var(--text2)",
                border: `1.5px solid ${region === r ? "var(--primary)" : "var(--border)"}`,
                transition: "all 0.15s",
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          paddingBottom: 80,
        }}
        className="no-scroll"
      >
        <div
          style={{
            color: "var(--text2)",
            fontSize: 13,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          {generatedBundles.length}개의 번들 코스
        </div>
        {generatedBundles.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ marginBottom: 12 }}>
              <IcoRoute size={48} color="var(--border)" />
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 6,
                color: "var(--text2)",
              }}
            >
              해당 조건의 번들이 없어요
            </div>
            <div style={{ fontSize: 14, color: "var(--text3)" }}>
              지역 필터를 변경해보세요
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isWide
                  ? "repeat(3,1fr)"
                  : "repeat(2,1fr)",
              gap: 16,
            }}
          >
            {generatedBundles.map((b) => (
              <BundleMakerCard
                key={b.id}
                bundle={b}
                onClick={() => onSelectBundle(b)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BundleMakerCard({
  bundle,
  onClick,
}: {
  bundle: Bundle;
  onClick: () => void;
}) {
  const courseItems = bundle.course.filter((s) => s.item);
  const themes = courseItems.map((s) => s.item!.theme);
  const imgs = courseItems.map((s) => s.item!.img);
  const width = useWindowWidth();
  const isMobile = width < 768;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.13)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
      }}
    >
      <div
        style={{
          display: "flex",
          height: isMobile ? 120 : 150,
          position: "relative",
        }}
      >
        {themes.slice(0, 3).map((theme, i) => (
          <div key={i} style={{ flex: 1 }}>
            <PlaceholderImg
              theme={theme}
              img={imgs[i]}
              height={isMobile ? 120 : 150}
            />
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "linear-gradient(transparent, rgba(0,0,0,0.35))",
          }}
        />
      </div>
      <div style={{ padding: isMobile ? "12px 14px 14px" : "14px 18px 16px" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: isMobile ? 14 : 16,
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          {bundle.title}
        </div>
        <div
          style={{
            fontSize: isMobile ? 12 : 13,
            color: "var(--text2)",
            marginBottom: 10,
            lineHeight: 1.6,
          }}
        >
          {bundle.description}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--text2)",
              }}
            >
              <IcoRuler size={12} color="var(--text3)" />
              {bundle.distance}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--text2)",
              }}
            >
              <IcoPin size={12} color="var(--text3)" />
              {bundle.region}
            </div>
            {bundle.stroller && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                <IcoStroller size={12} color="var(--primary)" />
                유아차
              </div>
            )}
          </div>
          <div
            style={{
              background: "var(--tag-bg)",
              color: "var(--primary)",
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              padding: "7px 14px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            코스 보기 <IcoArrowRight size={12} color="var(--primary)" />
          </div>
        </div>
      </div>
    </div>
  );
}
