"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Transport, DistanceTolerance, AtmospherePreference } from "@/types/participant";
import { LocationSearchInput } from "@/app/components/LocationSearchInput";
import { TransportPicker } from "@/app/components/TransportPicker";
import { DistancePicker } from "@/app/components/DistancePicker";
import { AtmospherePicker } from "@/app/components/AtmospherePicker";
import { DateAvailabilityPicker } from "@/app/components/DateAvailabilityPicker";
import {
  joinRoom,
  savePreference,
  saveAvailableDates,
  getAvailableDates,
} from "@/app/actions/participant";

// ── 섹션 카드 래퍼 ────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  animationDelay?: string;
  className?: string;
}

interface LocationPreference {
  name: string;
  lat: number;
  lng: number;
}

function SectionCard({ icon, title, children, animationDelay, className }: SectionCardProps) {
  return (
    <section
      className={[
        "relative bg-surface border border-hairline rounded-2xl p-5 sm:p-6 lg:p-7 transition-all duration-200 hover:border-hairline-strong focus-within:border-accent/60",
        className,
      ].filter(Boolean).join(" ")}
      style={{ animation: `fade-up 0.4s ease-out ${animationDelay ?? "0s"} both` }}
    >
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-light text-accent shrink-0">{icon}</span>
        <h2 className="text-[16px] sm:text-[17px] font-black text-ink leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── 필드 레이블 ───────────────────────────────────────────────

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold text-ink-muted tracking-[2px] uppercase mb-3"
    >
      {children}
    </label>
  );
}

// ── 아이콘 ───────────────────────────────────────────────────

function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.5C6.51 1.5 4.5 3.51 4.5 6c0 3.75 4.5 10.5 4.5 10.5S13.5 9.75 13.5 6c0-2.49-2.01-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconTransport() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 8h14" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="12.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="3.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 2v3M12 2v3M2 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── PreferencesPage ───────────────────────────────────────────

function PreferenceSubmitButton({
  canSubmit,
  isSaving,
  onClick,
  idleIcon,
  className,
}: {
  canSubmit: boolean;
  isSaving: boolean;
  onClick: () => void;
  idleIcon: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSubmit || isSaving}
      className={[
        "rounded-xl bg-accent text-white font-bold flex items-center justify-center gap-2 transition-all duration-200",
        "shadow-[0_2px_8px_rgba(94,106,210,0.35)] enabled:hover:-translate-y-0.5 enabled:hover:bg-accent-hover enabled:hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "disabled:opacity-45 disabled:cursor-not-allowed active:translate-y-0 active:scale-[0.98]",
        className,
      ].filter(Boolean).join(" ")}
      style={{
        animation: canSubmit && !isSaving ? "cta-glow 2.8s ease-in-out infinite" : undefined,
      }}
    >
      {isSaving ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>저장하는 중</span>
        </>
      ) : (
        <>
          {idleIcon}
          <span>선호 저장하기</span>
        </>
      )}
    </button>
  );
}

export default function PreferencesPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = decodeURIComponent((params?.code as string) ?? "").toUpperCase();

  /* ── 폼 상태 ── */
  const [myLocation, setMyLocation] = useState("");
  const [myLat, setMyLat] = useState(0);
  const [myLng, setMyLng] = useState(0);
  const [myTransports, setMyTransports] = useState<Transport | null>(null);
  const [myDistance, setMyDistance] = useState<DistanceTolerance | null>(null);
  const [myAtmosphere, setMyAtmosphere] = useState<AtmospherePreference | null>(null);
  const [myDates, setMyDates] = useState<string[]>([]);

  /* ── UI 상태 ── */
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── 저장된 선호 복원 ── */
  useEffect(() => {
    async function restore() {
      try {
        const { savedPreference } = await joinRoom(roomCode);
        const savedDates = await getAvailableDates(roomCode);

        if (savedPreference) {
          setMyLocation(savedPreference.abstractLocation);
          setMyLat(savedPreference.lat);
          setMyLng(savedPreference.lng);
          setMyTransports((savedPreference.transports[0] as Transport) ?? null);
          if (savedPreference.distanceTolerance)
            setMyDistance(savedPreference.distanceTolerance as DistanceTolerance);
          if (savedPreference.atmospherePreference)
            setMyAtmosphere(savedPreference.atmospherePreference as AtmospherePreference);
        }
        if (savedDates.length > 0) setMyDates(savedDates);
      } catch {
        // 복원 실패 시 빈 폼으로 시작
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, [roomCode]);

  /* ── 제출 ── */
  async function handleSubmit() {
    if (!myLocation.trim()) {
      setError("출발 지역을 입력해주세요");
      return;
    }
    if (!myLat || !myLng) {
      setError("목록에서 장소를 선택해주세요");
      return;
    }
    if (!myTransports) {
      setError("이동 수단을 선택해주세요");
      return;
    }
    if (!myDistance) {
      setError("이동 거리 선호를 선택해주세요");
      return;
    }
    if (!myAtmosphere) {
      setError("선호 분위기를 선택해주세요");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const prefResult = await savePreference({
        roomCode,
        abstractLocation: myLocation,
        lat: myLat,
        lng: myLng,
        transports: [myTransports],
        distanceTolerance: myDistance,
        atmospherePreference: myAtmosphere,
      });

      if (!prefResult.ok) {
        setError(prefResult.reason);
        return;
      }

      if (myDates.length > 0) {
        const dateResult = await saveAvailableDates(roomCode, myDates);
        if (!dateResult.ok) {
          setError(dateResult.reason ?? "날짜 저장에 실패했어요");
          return;
        }
      }

      router.push(`/rooms/${roomCode}`);
    } catch {
      setError("저장 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  const canSubmit =
    !!myLocation.trim() && !!myLat && !!myLng &&
    !!myTransports && !!myDistance && !!myAtmosphere;

  /* ── 로딩 스켈레톤 ── */
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-surface-3 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div
      className="flex-1 overflow-y-auto pb-36 lg:pb-14"
      style={{ animation: "cinematic-up 0.5s ease-out both" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* ── 페이지 헤더 ── */}
        <div className="mb-7 sm:mb-9" style={{ animation: "fade-up 0.4s ease-out 0.02s both" }}>
          <button
            type="button"
            onClick={() => router.push(`/rooms/${roomCode}`)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 -ml-2 text-[13px] font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            모임으로 돌아가기
          </button>

          <p className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-[11px] font-bold text-accent tracking-[2.4px] uppercase mb-3">
            {roomCode}
          </p>
          <h1 className="text-[30px] sm:text-[38px] font-black text-ink leading-[1.08] mb-3">
            선호를 알려주세요
          </h1>
          <p className="max-w-2xl text-[14px] sm:text-[15px] text-ink-muted leading-relaxed">
            입력하신 정보를 바탕으로 피니가 모두를 위한 장소를 찾아드려요
          </p>
        </div>

        {/* ── 섹션 카드 목록 ── */}
        <div className="space-y-5 sm:space-y-6">

          {/* 섹션 1: 출발지 & 이동수단 */}
          <SectionCard
            icon={<IconLocation />}
            title="출발지 & 이동수단"
            animationDelay="0.08s"
            className="z-30"
          >
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div className="relative z-20">
                <FieldLabel htmlFor="location-search">출발 지역</FieldLabel>
                <LocationSearchInput
                  value={myLocation}
                  error={error?.includes("지역") || error?.includes("장소")}
                  onSelect={(result) => {
                    setMyLocation(result.name);
                    setMyLat(result.lat);
                    setMyLng(result.lng);
                    setError(null);
                  }}
                />
              </div>
              <div className="min-w-0">
                <FieldLabel>이동 수단</FieldLabel>
                <p className="text-[11px] text-ink-subtle mb-3">오늘 이용할 수단 하나</p>
                <TransportPicker
                  value={myTransports}
                  onChange={(t) => { setMyTransports(t); setError(null); }}
                />
              </div>
            </div>
          </SectionCard>

          {/* 섹션 2: 이동 거리 & 분위기 */}
          <SectionCard icon={<IconTransport />} title="거리 & 분위기" animationDelay="0.14s">
            <div className="space-y-7">
              <div>
                <FieldLabel>이동 거리 선호</FieldLabel>
                <DistancePicker
                  value={myDistance}
                  onChange={(d) => { setMyDistance(d); setError(null); }}
                />
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-hairline to-transparent" />
              <div>
                <FieldLabel>선호 분위기</FieldLabel>
                <AtmospherePicker
                  value={myAtmosphere}
                  onChange={(a) => { setMyAtmosphere(a); setError(null); }}
                />
              </div>
            </div>
          </SectionCard>

          {/* 섹션 3: 가능한 날짜 */}
          <SectionCard icon={<IconCalendar />} title="가능한 날짜" animationDelay="0.20s">
            <p className="text-[13px] sm:text-[14px] text-ink-muted leading-relaxed mb-5 sm:mb-6">
              참가 가능한 날짜를 선택해주세요. 피니가 모든 참가자의 날짜를 비교해
              가장 많은 사람이 가능한 날을 추천해드려요. <br />
              <span className="text-ink-subtle font-medium"> (선택 사항, 최대 5개)</span>
            </p>
            <DateAvailabilityPicker value={myDates} onChange={setMyDates} />
          </SectionCard>

        </div>

        {/* ── 에러 메시지 ── */}
        {error && (
          <p
            key={error}
            role="alert"
            aria-live="assertive"
            className="mt-5 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-[13px] font-medium text-error text-center"
            style={{ animation: "fade-up 0.3s ease-out both" }}
          >
            {error}
          </p>
        )}

        {/* ── Desktop CTA ── */}
        <div
          className="hidden lg:flex items-center justify-between mt-10 pt-7 border-t border-hairline"
          style={{ animation: "fade-up 0.4s ease-out 0.26s both" }}
        >
          <button
            type="button"
            onClick={() => router.push(`/rooms/${roomCode}`)}
            className="h-12 px-5 rounded-xl border border-hairline bg-surface text-[14px] font-semibold text-ink-muted hover:-translate-y-0.5 hover:border-hairline-strong hover:text-ink hover:bg-surface-2 active:translate-y-0 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="h-12 px-9 rounded-xl text-[14px] font-bold flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            style={{
              backgroundColor: "#5e6ad2",
              color: "#fff",
              boxShadow: "0 1px 3px rgba(94,106,210,0.3)",
              animation: canSubmit && !isSaving ? "cta-glow 2.8s ease-in-out infinite" : undefined,
            }}
            onMouseEnter={(e) => {
              if (canSubmit && !isSaving)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f58b0";
            }}
            onMouseLeave={(e) => {
              if (canSubmit && !isSaving)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5e6ad2";
            }}
          >
            {isSaving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>저장하는 중…</span>
              </>
            ) : (
              <>
                <IconCheck />
                <span>선호 저장하기</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>

    {/* ── Mobile sticky CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-canvas from-75% to-transparent pointer-events-none">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSaving}
          className="w-full h-[56px] rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all duration-200 pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          style={{
            backgroundColor: "#5e6ad2",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(94,106,210,0.35)",
            animation: canSubmit && !isSaving ? "cta-glow 2.8s ease-in-out infinite" : undefined,
          }}
          onMouseEnter={(e) => {
            if (canSubmit && !isSaving)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f58b0";
          }}
          onMouseLeave={(e) => {
            if (canSubmit && !isSaving)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5e6ad2";
          }}
        >
          {isSaving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>저장하는 중…</span>
            </>
          ) : (
            <>
              <IconArrow />
              <span>선호 저장하기</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
