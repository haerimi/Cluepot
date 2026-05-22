"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  placeName: string;
  className?: string;
}

export function KakaoMap({ lat, lng, placeName, className = "" }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    function init() {
      const coords = new window.kakao.maps.LatLng(lat, lng);
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: coords,
        level: 4,
      });

      const marker = new window.kakao.maps.Marker({ position: coords, map });

      const info = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;white-space:nowrap;">${placeName}</div>`,
      });
      info.open(map, marker);
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(init);
    } else {
      // SDK not yet loaded — wait for it
      const id = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(id);
          window.kakao.maps.load(init);
        }
      }, 200);
      return () => clearInterval(id);
    }
  }, [lat, lng, placeName]);

  return <div ref={containerRef} className={className} />;
}
