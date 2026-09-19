"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  PlaceholderImg,
  BottomSheet,
  PrimaryBtn,
} from "@/shared/ui";
import {
  IcoSearch,
  IcoFilter,
  IcoStroller,
  IcoCar,
  IcoAccessible,
  IcoReset,
  IcoXClose,
  IcoSpark,
} from "@/shared/ui";
import { REGIONS, mapTourSpotToSpot } from "@/entities/spot";
import { useWindowWidth } from "@/shared/lib";
import { useSearchTour } from "@/shared/api/generated/search/search";
import { REGION_LABELS } from "@/shared/api/region-labels";
import type {
  SearchTourParams,
  Depth1,
  Depth2,
  Region,
} from "@/shared/api/generated/model";
import type { SpotOrFestival, FilterState } from "@/shared/types";

// 한글 지역 라벨 → API Region enum 역매핑 (검색 필터에서 사용)
const LABEL_TO_REGION: Record<string, Region> = Object.fromEntries(
  Object.entries(REGION_LABELS).map(([code, label]) => [label, code as Region]),
);

const PAGE_SIZE = 20; // 페이지당 결과 수

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
  const [page, setPage] = useState(1);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const px = isMobile ? 16 : 28;

  // 필터/검색어가 바뀌면 페이지를 1로 리셋 (렌더 단계 동기화 — effect 아님)
  const filterKey = JSON.stringify({ query, filters });
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const activeFilterCount = [
    filters.regions.length > 0,
    filters.groups.length > 0,
    filters.types.length > 0,
    filters.stroller,
    filters.nursing,
    filters.parking,
    filters.accessible,
  ].filter(Boolean).length;

  // 화면 필터 상태 → 검색 API query 파라미터 (page/size 포함)
  const searchParams = useMemo<SearchTourParams>(() => {
    const params: SearchTourParams = { page, size: PAGE_SIZE };
    if (query.trim()) params.tourName = query.trim();
    if (filters.stroller) params.isStrollerRental = true;
    if (filters.parking) params.isPark = true;
    if (filters.accessible) params.isToilet = true;
    if (filters.regions.length) {
      // 한글 라벨 → Region enum. 선택된 지역 전체를 배열로 전달.
      const regions = filters.regions
        .map((label) => LABEL_TO_REGION[label])
        .filter(Boolean) as Region[];
      if (regions.length) params.region = regions;
    }
    if (filters.groups.length) params.depth1 = filters.groups as Depth1[];
    if (filters.types.length) params.depth2 = filters.types as Depth2[];
    return params;
  }, [query, filters, page]);

  // 처음 진입했을 때(검색어·필터 모두 없음)는 요청하지 않고 안내만 보여준다
  const hasCondition = query.trim().length > 0 || activeFilterCount > 0;
  const { data, isLoading, isError } = useSearchTour(searchParams, {
    query: { enabled: hasCondition },
  });

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  // API 결과(TourSpot[]) → 로컬 Spot[]
  const filtered = useMemo<SpotOrFestival[]>(
    () => (data?.items ?? []).map((t) => mapTourSpotToSpot(t, "geology")),
    [data],
  );

  // 페이지 이동 시 결과 목록을 맨 위로 스크롤
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [page]);

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
        ref={listRef}
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
          {!hasCondition
            ? ""
            : isLoading
              ? "검색 중…"
              : `${totalElements}개의 관광지를 찾았어요`}
        </div>
        {!hasCondition ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: 60,
              color: "var(--text2)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              어떤 곳을 찾으세요?
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              관광지 이름을 검색하거나
              <br />
              [필터]에서 관광지 종류를 골라 보세요
            </div>
          </div>
        ) : isLoading ? (
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

        {!isLoading && !isError && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  // 현재 페이지 주변 최대 5개의 페이지 번호를 표시
  const windowSize = 5;
  const end = Math.min(totalPages, Math.max(page + 2, windowSize));
  const start = Math.max(1, Math.min(page - 2, end - windowSize + 1));
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const cell = (active: boolean): React.CSSProperties => ({
    minWidth: 34,
    height: 34,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
    background: active ? "var(--primary)" : "var(--surface)",
    color: active ? "#fff" : "var(--text2)",
    padding: "0 8px",
    cursor: "pointer",
  });
  const nav = (disabled: boolean): React.CSSProperties => ({
    ...cell(false),
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 24,
        flexWrap: "wrap",
      }}
    >
      <button style={nav(page <= 1)} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      {start > 1 && (
        <>
          <button style={cell(false)} onClick={() => onChange(1)}>1</button>
          {start > 2 && <span style={{ color: "var(--text3)" }}>…</span>}
        </>
      )}
      {pages.map((p) => (
        <button key={p} style={cell(p === page)} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: "var(--text3)" }}>…</span>}
          <button style={cell(false)} onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        style={nav(page >= totalPages)}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
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
        <div
          style={
            {
              fontWeight: 700,
              fontSize: 13,
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
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {/* 홈 관광지 카드와 같은 구성 — 없는 항목도 회색으로 함께 보여준다 */}
          {[
            { key: "stroller", label: "유아차 대여", Icon: IcoStroller, ok: item.stroller },
            { key: "parking", label: "주차", Icon: IcoCar, ok: item.parking },
            { key: "toilet", label: "화장실", Icon: IcoAccessible, ok: item.accessible },
          ].map((b) => (
            <span
              key={b.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                background: b.ok ? "var(--tag-bg)" : "#F2F2F2",
                color: b.ok ? "var(--primary)" : "#C0C0C0",
                border: `1px solid ${b.ok ? "var(--border)" : "#EBEBEB"}`,
              }}
            >
              <b.Icon size={10} color={b.ok ? "var(--primary)" : "#C0C0C0"} />
              <span>{b.label}</span>
            </span>
          ))}
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
  { key: "VE", label: "문화" },
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
  VE01: { label: "랜드마크관광", group: "VE" },
  VE02: { label: "테마공원", group: "VE" },
  VE03: { label: "도시공원", group: "VE" },
  VE04: { label: "도시.지역문화관광", group: "VE" },
  VE05: { label: "복합관광시설", group: "VE" },
  VE06: { label: "공연시설", group: "VE" },
  VE07: { label: "전시시설", group: "VE" },
  VE08: { label: "행사시설", group: "VE" },
  VE09: { label: "교육시설", group: "VE" },
  VE10: { label: "레저스포츠시설", group: "VE" },
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
                ["stroller", IcoStroller, "유아차 대여"],
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
