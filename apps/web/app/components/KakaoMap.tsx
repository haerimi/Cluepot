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
        content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;white-space:nowrap;color:#000;">${placeName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;")}</div>`,
      });
      info.open(map, marker);
    }

    if (window.kakao?.maps) {
      // SDK already loaded — invoke the load callback immediately
      window.kakao.maps.load(init);
      return () => { cancelled = true; };
    } else {
      // SDK script is still loading — attach a one-time load listener to the
      // existing <script> tag instead of polling with setInterval.
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="dapi.kakao.com/v2/maps"]'
      );
      if (script) {
        const onLoad = () => {
          if (!cancelled) window.kakao.maps.load(init);
        };
        script.addEventListener("load", onLoad, { once: true });
        return () => {
          cancelled = true;
          script.removeEventListener("load", onLoad);
        };
      }
      return () => { cancelled = true; };
    }
  }, [lat, lng, placeName]);

  return <div ref={containerRef} className={className} />;
}
