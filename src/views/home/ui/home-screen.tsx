"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { mapTourSpotToSpot } from "@/entities/spot";
import { REGION_LABELS } from "@/shared/api/region-labels";
import { useWindowWidth } from "@/shared/lib";
import type { SpotOrFestival, Bundle, Theme } from "@/shared/types";
import type { TourSpot } from "@/shared/api/generated/model";
import {
  useGetHistoryTourTop5,
  useGetExperienceTourTop5,
  useGetNatureTourTop5,
  useGetRecentlyOpened,
} from "@/shared/api/generated/home/home";
import { TourSection } from "./tour-section";

interface Props {
  onSelectItem: (item: SpotOrFestival) => void;
  onSelectBundle: (bundle: Bundle) => void;
  onAddTrip: (item: SpotOrFestival, date: string) => void;
  savedTrips: { itemId: string }[];
}

type BannerSlide = { spot: TourSpot; theme: Theme; label: string };

export function HomeScreen({ onSelectItem }: Props) {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isWide = width >= 1200;
  const px = isMobile ? 16 : isWide ? 48 : 32;
  const cardCols = isMobile ? 2 : isWide ? 5 : 3;

  const historyTour = useGetHistoryTourTop5();
  const experienceTour = useGetExperienceTourTop5();
  const natureTour = useGetNatureTourTop5();
  const recentlyOpened = useGetRecentlyOpened();

  // 각 Top5 쿼리의 1위(top1) 여행지 3곳으로 배너 슬라이드 구성.
  const bannerSlides = [
    historyTour.data?.[0] && {
      spot: historyTour.data[0],
      theme: "geology" as Theme,
      label: "🏛️ 지금 인기 역사관광지",
    },
    experienceTour.data?.[0] && {
      spot: experienceTour.data[0],
      theme: "farm" as Theme,
      label: "🎨 지금 인기 체험관광지",
    },
    natureTour.data?.[0] && {
      spot: natureTour.data[0],
      theme: "forest" as Theme,
      label: "🌲 지금 인기 자연관광지",
    },
  ].filter(Boolean) as BannerSlide[];

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        paddingBottom: isMobile ? 80 : 40,
      }}
      className="no-scroll"
    >
      {/* Hero Banner (역사·체험·자연 Top1 자동 순환) */}
      <HeroBanner
        key={bannerSlides.length}
        slides={bannerSlides}
        onSelectItem={onSelectItem}
        isMobile={isMobile}
        isWide={isWide}
        px={px}
      />

      <div style={{ padding: `28px ${px}px 0` }}>
        <TourSection
          title="🏛️ 지금 인기 역사관광지 Top 5"
          items={historyTour.data}
          isLoading={historyTour.isLoading}
          isError={historyTour.isError}
          isMobile={isMobile}
          cardCols={cardCols}
          px={px}
          theme="geology"
          onSelectItem={onSelectItem}
        />
        <TourSection
          title="🎨 지금 인기 체험관광지 Top 5"
          items={experienceTour.data}
          isLoading={experienceTour.isLoading}
          isError={experienceTour.isError}
          isMobile={isMobile}
          cardCols={cardCols}
          px={px}
          theme="farm"
          onSelectItem={onSelectItem}
        />
        <TourSection
          title="🌲 지금 인기 자연관광지 Top 5"
          items={natureTour.data}
          isLoading={natureTour.isLoading}
          isError={natureTour.isError}
          isMobile={isMobile}
          cardCols={cardCols}
          px={px}
          theme="forest"
          onSelectItem={onSelectItem}
        />
        <TourSection
          title="🌱 새로 생긴 곳"
          items={recentlyOpened.data}
          isLoading={recentlyOpened.isLoading}
          isError={recentlyOpened.isError}
          isMobile={isMobile}
          cardCols={cardCols}
          px={px}
          theme="wetland"
          showRank={false}
          onSelectItem={onSelectItem}
        />
      </div>
    </div>
  );
}

function HeroBanner({
  slides,
  onSelectItem,
  isMobile,
  isWide,
  px,
}: {
  slides: BannerSlide[];
  onSelectItem: (item: SpotOrFestival) => void;
  isMobile: boolean;
  isWide: boolean;
  px: number;
}) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState(true);
  const [visible, setVisible] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const minHeight = isMobile ? 220 : 340;

  // 배너가 화면에 보일 때만 자동 전진한다.
  // (홈이 다른 화면에 가려지면 display:none → 트랜지션·transitionend가 멈춰
  //  index 리셋이 안 되고 계속 증가 → 복귀 시 빈 배너가 되던 문제 방지)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (!e.isIntersecting) {
        setAnim(false);
        setIndex(0); // 숨겨지면 처음으로 되돌려 복귀 시 항상 슬라이드0부터
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 보이는 동안에만 5초마다 다음 슬라이드로 (2개 이상일 때)
  useEffect(() => {
    if (!visible || n <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), 5000);
    return () => clearInterval(id);
  }, [visible, n]);

  // 마지막(첫 슬라이드 클론) 도달 후 애니메이션 없이 처음으로 스냅 → 무한 순환
  useEffect(() => {
    if (!anim) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnim(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
  }, [anim]);

  if (n === 0) {
    return (
      <div style={{ position: "relative", minHeight, background: "var(--primary)" }} />
    );
  }

  // 무한 순환용: 첫 슬라이드를 끝에 하나 더 붙인다.
  const extended = [...slides, slides[0]];

  return (
    <div ref={boxRef} style={{ position: "relative", overflow: "hidden", minHeight }}>
      <div
        onTransitionEnd={() => {
          if (index === n) {
            setAnim(false);
            setIndex(0);
          }
        }}
        style={{
          display: "flex",
          width: "100%",
          height: minHeight,
          transform: `translateX(-${index * 100}%)`,
          transition: anim ? "transform 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      >
        {extended.map((slide, i) => (
          <BannerSlideView
            key={i}
            slide={slide}
            onSelectItem={onSelectItem}
            isMobile={isMobile}
            isWide={isWide}
            px={px}
            minHeight={minHeight}
          />
        ))}
      </div>

      {n > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 2,
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: index % n === i ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: index % n === i ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerSlideView({
  slide,
  onSelectItem,
  isMobile,
  isWide,
  px,
  minHeight,
}: {
  slide: BannerSlide;
  onSelectItem: (item: SpotOrFestival) => void;
  isMobile: boolean;
  isWide: boolean;
  px: number;
  minHeight: number;
}) {
  const { spot, theme, label } = slide;
  const region = REGION_LABELS[spot.region] ?? spot.region;
  const tags = [
    spot.isStrollerRental && "유아차 ✓",
    spot.isPark && "주차 ✓",
    spot.isToilet && "화장실 ✓",
  ].filter(Boolean) as string[];

  return (
    <div
      style={{
        flex: "0 0 100%",
        width: "100%",
        position: "relative",
        height: minHeight,
        overflow: "hidden",
      }}
    >
      {spot.imgUrl ? (
        <Image
          src={spot.imgUrl}
          alt=""
          fill
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "var(--primary)" }} />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isMobile
            ? "linear-gradient(to top, rgba(20,50,30,0.85) 0%, rgba(20,50,30,0.45) 55%, rgba(20,50,30,0.15) 100%)"
            : "linear-gradient(to right, rgba(20,50,30,0.88) 0%, rgba(20,50,30,0.60) 45%, rgba(20,50,30,0.08) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? `28px ${px}px 28px` : `52px ${px}px 48px`,
          maxWidth: isWide ? 580 : "60%",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: isMobile ? 13 : 15,
            fontWeight: 600,
            marginBottom: 8,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: isMobile ? 24 : 36,
            lineHeight: 1.25,
            marginBottom: 6,
            textShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          {spot.name}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: isMobile ? 13 : 15,
            marginBottom: 16,
          }}
        >
          {region}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {tags.map((t) => (
            <div
              key={t}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                fontSize: isMobile ? 11 : 13,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 20,
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => onSelectItem(mapTourSpotToSpot(spot, theme))}
          style={{
            background: "#fff",
            color: "var(--primary)",
            fontWeight: 700,
            fontSize: isMobile ? 13 : 15,
            padding: isMobile ? "10px 20px" : "13px 26px",
            borderRadius: 24,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          자세히 보기 →
        </button>
      </div>
    </div>
  );
}
