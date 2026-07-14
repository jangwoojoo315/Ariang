"use client";
import { SectionHeader, TourSpotCard } from "@/shared/ui";
import { mapTourSpotToSpot } from "@/entities/spot";
import type { TourSpot, RecentPlace } from "@/shared/api/generated/model";
import type { SpotOrFestival, Theme } from "@/shared/types";

interface TourSectionProps {
  title: string;
  items: (TourSpot | RecentPlace)[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isMobile: boolean;
  cardCols: number;
  px: number;
  theme: Theme;
  onSelectItem: (item: SpotOrFestival) => void;
  showRank?: boolean;
}

export function TourSection({
  title,
  items,
  isLoading,
  isError,
  isMobile,
  cardCols,
  px,
  theme,
  onSelectItem,
  showRank = true,
}: TourSectionProps) {
  const handleSelect = (item: TourSpot | RecentPlace) =>
    onSelectItem(mapTourSpotToSpot(item, theme));
  return (
    <>
      <SectionHeader title={title} />
      {isLoading ? (
        <div style={{ padding: "24px 0", color: "var(--text2)", fontSize: 13 }}>
          불러오는 중…
        </div>
      ) : isError ? (
        <div style={{ padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>
          정보를 불러오지 못했어요.
        </div>
      ) : !items || items.length === 0 ? (
        <div style={{ padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>
          표시할 곳이 없어요.
        </div>
      ) : isMobile ? (
        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            margin: `0 -${px}px`,
            padding: `0 ${px}px 16px`,
          }}
          className="no-scroll"
        >
          {items.map((item, i) => (
            <TourSpotCard
              key={item.id}
              item={item}
              rank={showRank ? i + 1 : undefined}
              onClick={() => handleSelect(item)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cardCols}, 1fr)`,
            gap: 18,
            marginBottom: 16,
          }}
        >
          {items.map((item, i) => (
            <TourSpotCard
              key={item.id}
              item={item}
              rank={showRank ? i + 1 : undefined}
              fill
              onClick={() => handleSelect(item)}
            />
          ))}
        </div>
      )}
    </>
  );
}
