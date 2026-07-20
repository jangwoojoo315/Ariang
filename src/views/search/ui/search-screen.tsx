"use client";
import { useMemo, useState } from "react";
import {
  PlaceholderImg,
  ThemeChip,
  BottomSheet,
  PrimaryBtn,
} from "@/shared/ui";
import {
  IcoSearch,
  IcoFilter,
  IcoStroller,
  IcoMilk,
  IcoCar,
  IcoAccessible,
  IcoReset,
  IcoXClose,
  IcoSpark,
} from "@/shared/ui";
import { REGIONS, mapTourSpotToSpot } from "@/entities/spot";
import { useWindowWidth } from "@/shared/lib";
import { useSearchHistoryTour } from "@/shared/api/generated/search/search";
import { REGION_LABELS } from "@/shared/api/region-labels";
import type {
  SearchHistoryTourParams,
  Depth1,
  Depth2,
  Region,
} from "@/shared/api/generated/model";
import type { SpotOrFestival, FilterState } from "@/shared/types";

// 한글 지역 라벨 → API Region enum 역매핑 (검색 필터에서 사용)
const LABEL_TO_REGION: Record<string, Region> = Object.fromEntries(
  Object.entries(REGION_LABELS).map(([code, label]) => [label, code as Region]),
);

interface Props {
  onSelectItem: (item: SpotOrFestival) => void;
}

export function SearchScreen({ onSelectItem }: Props) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    regions: [],
    groups: [],
    types: [],
    stroller: false,
    nursing: false,
    parking: false,
    accessible: false,
  });
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  const activeFilterCount = [
    filters.regions.length > 0,
    filters.groups.length > 0,
    filters.types.length > 0,
    filters.stroller,
    filters.nursing,
    filters.parking,
    filters.accessible,
  ].filter(Boolean).length;

  // 화면 필터 상태 → 역사관광지 검색 API query 파라미터
  // (API는 지역/그룹을 단일 값만 받으므로, 하나만 선택된 경우에만 서버로 넘긴다)
  const searchParams = useMemo<SearchHistoryTourParams>(() => {
    const params: SearchHistoryTourParams = {};
    if (query.trim()) params.tourName = query.trim();
    if (filters.stroller) params.isStrollerRental = true;
    if (filters.parking) params.isPark = true;
    if (filters.accessible) params.isToilet = true;
    if (filters.regions.length === 1) {
      const region = LABEL_TO_REGION[filters.regions[0]];
      if (region) params.region = region;
    }
    if (filters.groups.length) params.depth1 = filters.groups as Depth1[];
    if (filters.types.length) params.depth2 = filters.types as Depth2[];
    return params;
  }, [query, filters]);

  const { data, isLoading, isError } = useSearchHistoryTour(searchParams);

  // API TourSpot[] → 로컬 Spot[]. 여러 지역을 선택한 경우 클라이언트에서 추가 필터링.
  const filtered = useMemo<SpotOrFestival[]>(() => {
    const spots = (data ?? []).map((t) => mapTourSpotToSpot(t, "geology"));
    if (filters.regions.length > 1) {
      return spots.filter((s) => filters.regions.includes(s.region));
    }
    return spots;
  }, [data, filters.regions]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "var(--surface)",
          padding: `16px ${px}px 0`,
          boxShadow: "0 1px 0 var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              borderRadius: 12,
              padding: "10px 14px",
              border: "1.5px solid var(--border)",
            }}
          >
            <IcoSearch size={16} color="var(--text3)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="관광지 이름, 지역 검색"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 14,
                color: "var(--text)",
                outline: "none",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ color: "var(--text3)", fontSize: 16 }}
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            style={{
              background:
                activeFilterCount > 0 ? "var(--primary)" : "var(--bg)",
              color: activeFilterCount > 0 ? "#fff" : "var(--text2)",
              border: `1.5px solid ${activeFilterCount > 0 ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 12,
              padding: "0 14px",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <IcoFilter
              size={14}
              color={activeFilterCount > 0 ? "#fff" : "var(--text2)"}
            />
            <span>
              필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `16px ${px}px`,
          paddingBottom: isMobile ? 80 : 24,
        }}
        className="no-scroll"
      >
        <div
          style={{
            color: "var(--text2)",
            fontSize: 13,
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          {isLoading
            ? "검색 중…"
            : `${filtered.length}개의 관광지를 찾았어요`}
        </div>
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: 60,
              color: "var(--text2)",
              fontSize: 14,
            }}
          >
            불러오는 중…
          </div>
        ) : isError ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: 60,
              color: "var(--text2)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              검색 결과를 불러오지 못했어요
            </div>
            <div style={{ fontSize: 14 }}>잠시 후 다시 시도해 주세요</div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: 60,
              color: "var(--text2)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              검색 결과가 없어요
            </div>
            <div style={{ fontSize: 14 }}>필터를 조정해 보세요</div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr 1fr"
                : "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((item) => (
              <SearchCard
                key={item.id}
                item={item}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <FilterSheet
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

function SearchCard({
  item,
  onClick,
}: {
  item: SpotOrFestival;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        borderRadius: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
      }}
    >
      <div style={{ position: "relative" }}>
        <PlaceholderImg theme={item.theme} img={item.img} height={110} />
        {item.isNew && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "var(--primary)",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            NEW <IcoSpark size={9} color="#fff" />
          </div>
        )}
      </div>
      <div style={{ padding: "9px 10px 11px" }}>
        <ThemeChip theme={item.theme} small />
        <div
          style={
            {
              fontWeight: 700,
              fontSize: 13,
              marginTop: 5,
              marginBottom: 2,
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            } as React.CSSProperties
          }
        >
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 5 }}>
          {item.region}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {item.stroller && (
            <span
              style={{
                fontSize: 10,
                color: "var(--primary)",
                background: "var(--tag-bg)",
                padding: "2px 6px",
                borderRadius: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <IcoStroller size={10} color="var(--primary)" />
              유아차
            </span>
          )}
          {item.nursing && (
            <span
              style={{
                fontSize: 10,
                color: "var(--primary)",
                background: "var(--tag-bg)",
                padding: "2px 6px",
                borderRadius: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <IcoMilk size={10} color="var(--primary)" />
              수유실
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleChip({
  Icon,
  label,
  active,
  onClick,
}: {
  Icon?: React.FC<{ size: number; color: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 13px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        background: active ? "var(--primary)" : "var(--bg)",
        color: active ? "#fff" : "var(--text2)",
        border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {Icon && <Icon size={12} color={active ? "#fff" : "var(--text2)"} />}
      {label}
    </button>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 10,
          color: "var(--text2)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const SPOT_TYPE_GROUPS = [
  { key: "HS", label: "역사" },
  { key: "NA", label: "자연" },
  { key: "EX", label: "체험" },
];

// 하위 항목 키는 API Depth2 코드와 동일하게 맞춘다.
const SPOT_TYPES = {
  HS01: { label: "역사유적지", group: "HS" },
  HS02: { label: "역사유물", group: "HS" },
  HS03: { label: "종교성지", group: "HS" },
  HS04: { label: "안보관광지", group: "HS" },
  NA01: { label: "자연경관(산)", group: "NA" },
  NA02: { label: "자연경관(하천‧해양)", group: "NA" },
  NA03: { label: "자연생태", group: "NA" },
  NA04: { label: "자연공원", group: "NA" },
  NA05: { label: "기타자연관광", group: "NA" },
  EX01: { label: "전통체험", group: "EX" },
  EX02: { label: "공예체험", group: "EX" },
  EX03: { label: "농.산.어촌 체험", group: "EX" },
  EX04: { label: "산사체험", group: "EX" },
  EX05: { label: "웰니스관광", group: "EX" },
  EX06: { label: "산업관광", group: "EX" },
  EX07: { label: "기타체험", group: "EX" },
};

function FilterSheet({
  filters,
  onApply,
  onClose,
}: {
  filters: FilterState;
  onApply: (next: FilterState) => void;
  onClose: () => void;
}) {
  // 시트 내부에서만 쓰는 임시 상태. "적용하기"를 눌러야 부모 filters에 반영된다.
  const [draft, setDraft] = useState<FilterState>(filters);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggle = (key: keyof FilterState) =>
    setDraft((f) => ({ ...f, [key]: !f[key] }));
  const toggleArr = (key: "regions" | "groups" | "types", val: string) =>
    setDraft((f) => ({
      ...f,
      [key]: (f[key] as string[]).includes(val)
        ? (f[key] as string[]).filter((v) => v !== val)
        : [...(f[key] as string[]), val],
    }));
  const clearFilters = () =>
    setDraft({
      regions: [],
      groups: [],
      types: [],
      stroller: false,
      nursing: false,
      parking: false,
      accessible: false,
    });
  const apply = () => {
    onApply(draft);
    onClose();
  };
  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>필터</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={clearFilters}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IcoReset size={16} color="var(--text2)" />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IcoXClose size={16} color="var(--text2)" />
            </button>
          </div>
        </div>

        <FilterSection title="육아 필수 시설">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(
              [
                ["stroller", IcoStroller, "유아차 대역"],
                ["parking", IcoCar, "주차장"],
                ["accessible", IcoAccessible, "화장실"],
              ] as [
                keyof FilterState,
                React.FC<{ size: number; color: string }>,
                string,
              ][]
            ).map(([key, Icon, label]) => (
              <ToggleChip
                key={key}
                Icon={Icon}
                label={label}
                active={draft[key] as boolean}
                onClick={() => toggle(key)}
              />
            ))}
          </div>
        </FilterSection>
        <FilterSection title="관광지 종류">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SPOT_TYPE_GROUPS.map((g) => {
              const isOpen = expandedGroup === g.key;
              const isSelected = draft.groups.includes(g.key);
              const subTypes = Object.entries(SPOT_TYPES).filter(
                ([, t]) => t.group === g.key,
              );
              return (
                <div
                  key={g.key}
                  style={{
                    border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                  }}
                >
                  <button
                    onClick={() => {
                      toggleArr("groups", g.key);
                      setExpandedGroup(isOpen ? null : g.key);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      background: isSelected
                        ? "var(--tag-bg)"
                        : "var(--surface)",
                      fontWeight: 700,
                      fontSize: 14,
                      color: isSelected ? "var(--primary)" : "var(--text)",
                    }}
                  >
                    <span>{g.label}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.15s",
                      }}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        padding: "2px 14px 12px",
                      }}
                    >
                      <ToggleChip
                        label="전체"
                        active={subTypes.every(([key]) =>
                          draft.types.includes(key),
                        )}
                        onClick={() => {
                          const allSelected = subTypes.every(([key]) =>
                            draft.types.includes(key),
                          );
                          setDraft((f) => ({
                            ...f,
                            types: allSelected
                              ? f.types.filter(
                                  (k) => !subTypes.some(([key]) => key === k),
                                )
                              : [
                                  ...f.types.filter(
                                    (k) => !subTypes.some(([key]) => key === k),
                                  ),
                                  ...subTypes.map(([key]) => key),
                                ],
                          }));
                        }}
                      />
                      {subTypes.map(([key, t]) => (
                        <ToggleChip
                          key={key}
                          label={t.label}
                          active={draft.types.includes(key)}
                          onClick={() => toggleArr("types", key)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FilterSection>
        <FilterSection title="지역">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {REGIONS.map((r) => (
              <ToggleChip
                key={r}
                label={r}
                active={draft.regions.includes(r)}
                onClick={() => toggleArr("regions", r)}
              />
            ))}
          </div>
        </FilterSection>

        <div style={{ paddingTop: 8, paddingBottom: 8 }}>
          <PrimaryBtn onClick={apply}>적용하기</PrimaryBtn>
        </div>
      </div>
    </BottomSheet>
  );
}
