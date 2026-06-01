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

    // Guard against the component unmounting while the SDK load callback is
    // still pending. Without this, `init` fires after unmount and tries to
    // call `new Map(null)` on the now-detached containerRef, throwing
    // "Cannot read properties of null".
    let cancelled = false;

    function init() {
      if (cancelled || !containerRef.current) return;
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
      return () => { cancelled = true; };
    } else {
      // SDK not yet loaded — poll until available
      const id = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(id);
          window.kakao.maps.load(init);
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }
  }, [lat, lng, placeName]);

  return <div ref={containerRef} className={className} />;
}
