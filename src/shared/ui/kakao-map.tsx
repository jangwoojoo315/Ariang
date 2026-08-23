'use client';
import { useEffect, useRef } from 'react';
import { useKakaoLoader } from '@/shared/lib/use-kakao-loader';

export interface MapMarker {
  lat: number;
  lng: number;
  name?: string;
}

interface Props {
  center: { lat: number; lng: number };
  markers?: MapMarker[];
  level?: number; // 줌 레벨(작을수록 확대)
  height?: number;
  style?: React.CSSProperties;
}

export function KakaoMap({ center, markers = [], level = 4, height = 200, style = {} }: Props) {
  const ready = useKakaoLoader();
  const boxRef = useRef<HTMLDivElement>(null);
  // 원시값 기반 의존성 (인라인 객체/배열 재생성으로 인한 불필요한 재실행 방지)
  const markersKey = markers.map((m) => `${m.lat},${m.lng},${m.name ?? ''}`).join('|');

  useEffect(() => {
    if (!ready || !boxRef.current) return;
    const { kakao } = window;
    const map = new kakao.maps.Map(boxRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });

    markers.forEach((m) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(m.lat, m.lng),
      });
      marker.setMap(map);
      if (m.name) {
        const iw = new kakao.maps.InfoWindow({
          content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">${m.name}</div>`,
        });
        kakao.maps.event.addListener(marker, 'click', () => iw.open(map, marker));
      }
    });

    // 바텀시트 등 컨테이너 크기가 나중에 잡히는 경우를 대비해 리레이아웃 후 중심 보정
    setTimeout(() => {
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, center.lat, center.lng, level, markersKey]);

  return <div ref={boxRef} style={{ width: '100%', height, ...style }} />;
}
