"use client";

/**
 * Room page — cinematic desktop layout with persistent grid transition
 *
 * ── Why no modal on desktop ──────────────────────────────────────────
 * The previous PiniPanel was a fixed overlay (z-50 backdrop + centred
 * dialog). On a 1440 px screen that means the product's most important
 * moment — the recommendation — played inside a ~768 px window with
 * ~336 px of unused space on each side. The result felt spatially weak.
 *
 * The fix: the page OWNS two persistent panes. When PINI results
 * arrive, the grid transition swaps which pane is wide and which is
 * narrow. No modal, no backdrop, no z-index stacking.
 *
 * ── Grid transition ──────────────────────────────────────────────────
 *
 *   BEFORE results  lg:grid-cols-[1fr_360px]
 *     [ participant / preference area ] [ pini ambient sidebar ]
 *
 *   AFTER results   lg:grid-cols-[360px_1fr]
 *     [ room summary ] [ full pini results pane ← owns the space ]
 *
 * The transition is driven by `hasResults = piniLoading || places.length > 0`.
 * CSS grid-template-columns is animatable between equal-track-count values
 * in Chromium 107+, Firefox 101+, Safari 16+. The inline `transition` style
 * uses `cubic-bezier(0.16, 1, 0.3, 1)` — an expo-out curve that makes the
 * pane feel like it settles into place rather than sliding mechanically.
 *
 * ── State ownership ──────────────────────────────────────────────────
 *
 * LOCAL (this component only):
 *   myLocation, myTransports, myDistance, myAtmosphere — form inputs
 *   locationSaved, locationError                       — form UI state
 *   piniLoading                                        — async flag
 *   piniOpen                                           — MOBILE ONLY, controls bottom sheet
 *   copied                                             — clipboard feedback
 *
 * GLOBAL (Zustand — also read by AppSidebar):
 *   useMapStore    recommendedPlaces, selectedPlace
 *   useScheduleStore  scheduleInfo
 *
 * The sidebar (AppSidebar) derives its phase label from the same Zustand
 * stores, so it stays in sync without any prop drilling.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ScheduleDateModal } from "./_components/ScheduleDateModal";
import { WaitingHostCenter } from "./_components/WaitingHostCenter";
import { WaitingParticipantCenter } from "./_components/WaitingParticipantCenter";
import { WaitingParticipantSidebar } from "./_components/WaitingParticipantSidebar";
import {
  Transport,
  DistanceTolerance,
  AtmospherePreference,
} from "@/types/participant";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { ParticipantCard } from "@/app/components/ParticipantCard";
import { RecommendedPlace } from "@/types/recommendation";
import { PiniPanel } from "@/app/components/PiniPanel";
import { useMapStore } from "@/store/map";
import { useScheduleStore } from "@/store/schedule";
import { useRoomStore } from "@/store/room";
import {
  getAvailableDates,
  getParticipants,
  getRecommendedDates,
  joinRoom,
  saveAvailableDates,
} from "@/app/actions/participant";
import { createSchedule, getScheduleByRoomCode } from "@/app/actions/schedule";
import { useUserStore } from "@/store/user";
import { extendRoomLink, checkRoomExists } from "@/app/actions/rooms";

/* ── Inferred type from server action ────────────────────────────────── */

type ParticipantWithUser = Awaited<
  ReturnType<typeof getParticipants>
>["participants"][number];

/* ── Schedule confirmed view ─────────────────────────────────────────── */

interface ScheduleViewProps {
  readonly placeName: string;
  readonly placeAddress: string;
  readonly roomCode: string;
  readonly onReset: () => void;
  readonly participants: ParticipantWithUser[];
  readonly currentUserId: string | undefined;
  readonly lng: number;
  readonly lat: number;
}

function handleViewMap(placeName: string, lat: number, lng: number) {
  const destination = `${encodeURIComponent(placeName)},${lat},${lng}`;
  return `https://map.kakao.com/link/to/${destination}`;
}

function ScheduleView({
  placeName,
  placeAddress,
  roomCode,
  onReset,
  participants,
  currentUserId,
  lng,
  lat
}: ScheduleViewProps) {
  const [copied, setCopied] = useState(false);


  function handleCopy() {
    navigator.clipboard.writeText(`${placeName}\n${placeAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full flex-1">
      <div className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-[576px] flex-col px-6 py-12 items-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center text-success mb-8">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="rgba(39,166,68,0.18)" stroke="#27a644" strokeWidth="2"/>
            <path d="M9 16l5 5 9-10" stroke="#27a644" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-[28px] lg:text-[34px] font-black text-ink tracking-tight text-center mb-3">
          모임 장소가 확정됐어요!
        </h2>
        <p className="text-[14px] text-ink-subtle text-center mb-10 leading-relaxed">
          참가자들에게 장소를 공유해드릴게요
        </p>

        {/* Confirmed card */}
        <div className="w-full bg-surface rounded-2xl border border-hairline p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="success" dot>
              확정
            </Badge>
            <Badge variant="muted">모임 {roomCode}</Badge>
          </div>
          <h3 className="text-[22px] font-black text-ink tracking-tight mb-1">
            {placeName}
          </h3>
          <p className="text-[13px] text-ink-subtle mb-5">{placeAddress}</p>
          <div className="h-px bg-hairline mb-5" />
          <div className="flex gap-2">
            <button
              onClick={() => window.open(handleViewMap(placeName, lat, lng), '_blank')}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5C4.52 1.5 2.5 3.52 2.5 6c0 3.75 4.5 7.5 4.5 7.5S11.5 9.75 11.5 6c0-2.48-2.02-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
              지도 보기
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="5" y="1.5" width="7.5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 4.5h2M1.5 12.5h8.5V4.5H1.5V12.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              복사
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="w-full mb-10">
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-4">
            참가자 확인
          </p>
          <div className="flex gap-2 flex-wrap">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-surface border border-hairline rounded-full px-3 py-1.5"
              >
                <div
                  className={
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"}
                >
                  {p.user.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.user.profileImage} alt={p.user.nickname}
                      className="w-full h-full object-cover rounded-full" />
                  ) : (
                    p.user.nickname.charAt(0)
                  )}
                </div>
                <span className="text-[12px] font-medium text-ink">
                  {p.user.nickname}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-hairline mb-8" />

        <div className="flex flex-col gap-3 w-full">
          <Link href="/">
            <Button variant="primary" size="lg" fullWidth>
              홈으로 돌아가기
            </Button>
          </Link>
          <Button variant="ghost" size="md" fullWidth onClick={onReset}>
            새 모임 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Room summary pane — left side after results arrive ──────────────── */

interface RoomSummaryPaneProps {
  readonly participants: ParticipantWithUser[];
  readonly locationSaved: boolean;
  readonly readyCount: number;
  readonly totalCount: number;
  readonly selectedPlaceName: string | null;
  readonly onConfirm: (() => void) | undefined;
  readonly onRerun: () => void;
  readonly currentUserId: string | undefined;
  readonly onResetPreference: () => void;
}

function RoomSummaryPane({
  participants,
  locationSaved,
  readyCount,
  totalCount,
  selectedPlaceName,
  onConfirm,
  onRerun,
  onResetPreference,
  currentUserId,
}: RoomSummaryPaneProps) {
  return (
    <div className="h-full overflow-y-auto px-6 lg:px-8 py-8 bg-surface border-r border-hairline">
      {/* Participants compact */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-4">
          참가자
        </p>
        <div className="space-y-2">
          {participants.map((p) => {
            const isReady =
              p.userId === currentUserId
                ? locationSaved
                : Boolean(p.abstractLocation);
            return (
              <div key={p.id} className="flex items-center gap-2.5">
                <div
                  className={
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"}
                >
                  {p.user.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.user.profileImage} alt={p.user.nickname}
                      className="w-full h-full object-cover rounded-full" />
                  ) : (
                    p.user.nickname.charAt(0)
                  )}
                </div>
                <span className="text-[13px] font-medium text-ink flex-1 truncate">
                  {p.user.nickname}
                </span>
                <span
                  className={[
                    "w-2 h-2 rounded-full shrink-0",
                    isReady ? "bg-success" : "bg-hairline-strong",
                  ].join(" ")}
                />
              </div>
            );
          })}
        </div>

        {/* Ready progress */}
        <div className="mt-4">
          <div className="h-1 rounded-full bg-hairline overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${(readyCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-ink-subtle mt-1.5">
            {readyCount}/{totalCount}명 준비 완료
          </p>
        </div>
      </div>

      <div className="h-px bg-hairline mb-6" />

      {/* Selected place CTA */}
      {selectedPlaceName ? (
        <div style={{ animation: "fade-up 0.3s ease-out both" }}>
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-3">
            선택된 장소
          </p>
          <p className="text-[14px] font-semibold text-ink mb-4 leading-snug">
            {selectedPlaceName}
          </p>
          {onConfirm && (
            <Button variant="primary" size="md" fullWidth onClick={onConfirm}>
              이 장소로 확정하기
            </Button>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-ink-subtle leading-relaxed">
          오른쪽에서 장소를 선택해주세요
        </p>
      )}

      <div className="mt-6">
        <button
          onClick={onRerun}
          className="text-[12px] text-ink-subtle hover:text-ink transition-colors underline underline-offset-2"
        >
          다시 추천받기
        </button>
      </div>
      <div className="mt-1">
        <button
          onClick={onResetPreference}
          className="text-[12px] text-ink-subtle hover:text-ink transition-colors underline underline-offset-2"
        >
          선호 다시 입력하기
        </button>
      </div>
    </div>
  );
}

/* ── Room link sheet ─────────────────────────────────────────────────── */

function formatRemaining(expiresAt: string | null): { text: string; warning: boolean } {
  if (!expiresAt) return { text: "알 수 없음", warning: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: "만료됨", warning: true };
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const warning = diff < 30 * 60_000; // 30분 미만이면 경고색
  if (hours > 0) return { text: `${hours}시간 ${minutes}분 남음`, warning };
  if (minutes > 0) return { text: `${minutes}분 남음`, warning };
  return { text: "잠시 후 만료", warning: true };
}

function RoomLinkSheet({
  roomCode,
  expiresAt,
  isHost,
  onCopy,
  copied,
  onExtend,
  onClose,
}: Readonly<{
  roomCode: string;
  expiresAt: string | null;
  isHost: boolean;
  onCopy: () => void;
  copied: boolean;
  onExtend: () => void;
  onClose: () => void;
}>) {
  const { text: remainingText, warning } = formatRemaining(expiresAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={onClose}
      />

      {/* sheet */}
      <div
        className="relative w-full max-w-90 bg-surface border border-hairline rounded-t-[24px] sm:rounded-2xl px-6 pt-6 pb-8"
        style={{ animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        <h3 className="text-[16px] font-black text-ink text-center mb-6 tracking-tight">
          모임 초대 코드
        </h3>

        {/* Room code — tap to copy */}
        <button
          onClick={onCopy}
          className="w-full flex items-center justify-between px-5 py-4 bg-surface-3 rounded-2xl mb-3 hover:bg-hairline transition-colors"
        >
          <span className="font-mono text-[28px] font-black text-ink tracking-[4px]">
            {roomCode}
          </span>
          <span className="text-ink-muted">
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="7" y="2" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3 7h3M3 18h12V7H3V18z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
        </button>
        {copied && (
          <p className="text-[12px] text-success text-center font-medium mb-3">
            클립보드에 복사됐어요!
          </p>
        )}

        {/* Expiry info */}
        <div
          className={[
            "flex items-center gap-3 px-4 py-3 rounded-xl mb-5",
            warning ? "bg-warning-fill" : "bg-surface-3",
          ].join(" ")}
        >
          <span className={`shrink-0 ${warning ? "text-warning-orange" : "text-ink-muted"}`}>
            {warning ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.5L16.5 15H1.5L9 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 7.5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="9" cy="12.5" r="0.8" fill="currentColor"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5.5v3.75l2.25 1.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
          <div>
            <p className="text-[10px] font-bold text-ink-subtle tracking-[1.5px] uppercase">
              링크 유효 시간
            </p>
            <p
              className={[
                "text-[13px] font-semibold",
                warning ? "text-warning-orange" : "text-ink",
              ].join(" ")}
            >
              {remainingText}
            </p>
          </div>
        </div>

        {/* Extend button — host only */}
        {isHost && (
          <button
            onClick={onExtend}
            className="w-full h-11 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-accent/90 transition-colors mb-3 flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5.5 8.5l3-3M3.5 9L2 10.5A2 2 0 104.5 13L6 11.5M8 5l1.5-1.5A2 2 0 1112 6.5L10.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            4시간 연장하기
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl border border-hairline text-[14px] font-semibold text-ink-muted hover:bg-surface-3 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = decodeURIComponent(
    (params?.code as string) ?? "",
  ).toUpperCase();

  /* ── Local form state ── */
  const [myLocation, setMyLocation] = useState("");
  const [myLat, setMyLat] = useState(0);
  const [myLng, setMyLng] = useState(0);
  const [myTransports, setMyTransports] = useState<Transport | null>(null);
  const [myDistance, setMyDistance] = useState<DistanceTolerance | null>(null);
  const [myAtmosphere, setMyAtmosphere] = useState<AtmospherePreference | null>(null);
  const [locationSaved, setLocationSaved] = useState(false);

  /* ── 날짜 state ── */
  const [myDates, setMyDates] = useState<string[]>([]);
  const [dateSaved, setDateSaved] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  /* ── PINI state ── */
  const [piniLoading, setPiniLoading] = useState(false);
  /* piniOpen is ONLY used for the mobile bottom-sheet variant */
  const [piniOpen, setPiniOpen] = useState(false);
  const [excludedPlaces, setExcludedPlaces] = useState<string[]>([]);
  const [piniError, setPiniError] = useState<string | null>(null);

  /* ── 모달 state ── */
  const [showDateModal, setShowDateModal] = useState(false);
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);
  const [scheduleCreateError, setScheduleCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  /* ── 방 메타 state ── */
  const [participants, setParticipants] = useState<ParticipantWithUser[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("waiting");
  const [isLoading, setIsLoading] = useState(true);
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  /* ── Zustand ── */
  const piniPlaces = useMapStore((s) => s.recommendedPlaces);
  const selectedPlace = useMapStore((s) => s.selectedPlace);
  const setSelectPlace = useMapStore((s) => s.selectPlace);
  const setPlace = useMapStore((s) => s.setPlaces);
  const clearMap = useMapStore((s) => s.clearMap);

  // isDone: scheduleInfo에서 파생 — 별도 셀렉터 불필요
  const scheduleInfo = useScheduleStore((s) => s.scheduleInfo);
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const isDone = scheduleInfo !== null && scheduleInfo.roomCode === roomCode;

  const currentUserId = useUserStore((s) => s.userInfo?.myId);
  const isMe = useCallback(
    (p: ParticipantWithUser) => p.userId === currentUserId,
    [currentUserId],
  );


  useEffect(() => {
    let active = true;

    async function participant() {
      const { isHost: host, savedPreference, linkExpiresAt: expiry, category: roomCategory, roomStatus: status } = await joinRoom(roomCode);
      const { participants: fetchedParticipants } =
        await getParticipants(roomCode);
      const savedDates = await getAvailableDates(roomCode)
      if (!active) return;
      if (savedDates.length > 0) {
        setMyDates(savedDates)
        setDateSaved(true)
      }

      setIsHost(host);
      setParticipants(fetchedParticipants);
      setLinkExpiresAt(expiry);  // joinRoom에서 바로 세팅 → 시트 즉시 표시 가능
      setCategory(roomCategory);
      setRoomStatus(status);

      // 새로고침해도 이전에 저장한 선호 복원
      if (savedPreference) {
        setMyLocation(savedPreference.abstractLocation);
        setMyTransports((savedPreference.transports[0] as Transport) ?? null);
        setMyLat(savedPreference.lat);
        setMyLng(savedPreference.lng);
        if (savedPreference.distanceTolerance)
          setMyDistance(savedPreference.distanceTolerance as DistanceTolerance);
        if (savedPreference.atmospherePreference)
          setMyAtmosphere(
            savedPreference.atmospherePreference as AtmospherePreference,
          );
        setLocationSaved(true);
      }

      // 이 방에 이미 확정된 일정이 있으면 ScheduleView로 복원 (Zustand 리셋 대응)
      const existing = await getScheduleByRoomCode(roomCode);
      if (!active) return;
      if (existing) {
        useScheduleStore.getState().setSchedule({
          scheduleId: existing.id,
          roomCode,
          placeName: existing.placeName,
          placeAddress: existing.placeAddress,
          lat: existing.lat,
          lng: existing.lng,
          title: existing.title,
          scheduledAt: existing.scheduledAt,
          memo: existing.memo ?? "",
        });
      }

      setIsLoading(false);
    }

    async function checkAndWatch() {
      const { exists } = await checkRoomExists(roomCode);

      if (!active) return;

      if (!exists) {
        useRoomStore.getState().removeActiveRoom(roomCode);
        router.push("/");
        return;
      }

      useRoomStore.getState().addActiveRoom(roomCode);
    }

    participant().catch(() => {
      setIsLoading(false);
    });
    checkAndWatch().catch(() => { });

    let pollIntervalId: ReturnType<typeof setInterval> | null = null;
    let schedulePollIntervalId: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      pollIntervalId = setInterval(async () => {
        try {
          const { participants } = await getParticipants(roomCode);
          setParticipants(participants);
        } catch { /* 방 이탈·만료 등 일시적 오류는 무시하고 다음 주기에 재시도 */ }
      }, 5000);

      schedulePollIntervalId = setInterval(async () => {
        try {
          if (useScheduleStore.getState().scheduleInfo) return;
          const existing = await getScheduleByRoomCode(roomCode);
          if (existing) router.push(`/calendar/${existing.id}`);
        } catch { /* 무시 */ }
      }, 5000);
    }

    function stopPolling() {
      if (pollIntervalId !== null) { clearInterval(pollIntervalId); pollIntervalId = null; }
      if (schedulePollIntervalId !== null) { clearInterval(schedulePollIntervalId); schedulePollIntervalId = null; }
    }

    function handleVisibility() {
      if (document.hidden) stopPolling();
      else startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    startPolling();

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
      useScheduleStore.getState().clearSchedule();
      useMapStore.getState().clearMap();
    };
  }, [roomCode]);

  const readyCount = participants.filter((p) =>
    p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation),
  ).length;
  const totalCount = participants.length;
  const allReady = totalCount > 0 && readyCount === totalCount;
  // progress를 한 곳에서 계산해 WaitingHostCenter·WaitingParticipantSidebar에 전달
  const readyProgress = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;

  /*
   * hasResults drives the grid transition.
   * True as soon as PINI fires (loading or done) so the pane expands
   * immediately, giving the user a spatial cue that results are coming.
   */
  const hasResults = piniLoading || piniPlaces.length > 0;
  
  /* ── Handlers ── */

  async function handleRunPini() {
    /* Open mobile sheet; desktop grid handles itself via hasResults */
    setPiniOpen(true);
    setPiniLoading(true);
    setPiniError(null);
    clearMap();

    try {
      // 날짜 투표 결과 가져오기 — 실패해도 추천은 계속 진행
      const recommendedDates = await getRecommendedDates(roomCode).catch(() => []);
      const topDate = recommendedDates[0];

      const res = await fetch('/api/pini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: participants.map(p => {
            // 현재 유저는 DB 값이 아닌 로컬 상태를 사용 (savePreference 후 participants 재fetch 없이도 정확)
            if (isMe(p)) {
              return {
                nickname: p.user.nickname,
                abstractLocation: myLocation,
                transports: myTransports ? [myTransports] : [],
                distanceTolerance: myDistance ?? 'medium',
                atmospherePreference: myAtmosphere ?? 'quiet',
                lat: myLat,
                lng: myLng,
              };
            }
            return {
              nickname: p.user.nickname,
              abstractLocation: p.abstractLocation ?? '',
              transports: p.transports,
              distanceTolerance: p.distanceTolerance ?? 'medium',
              atmospherePreference: p.atmospherePreference ?? 'quiet',
              lat: p.lat,
              lng: p.lng
            };
          }),
          category,
          excludePlaces: excludedPlaces,
          meetingDate: topDate?.date,
          participantCount: topDate?.count,
        })
      });

      if (!res.ok) {
        const body = await res.text();
        let msg = 'AI 추천 중 오류가 발생했어요.';
        try { msg = (JSON.parse(body) as { error?: string }).error ?? msg; } catch { /* ignore */ }
        // 근처 장소가 소진된 경우 제외 목록을 초기화해서 다음 시도에서 재시작할 수 있게 함
        if (msg.includes('더 이상 찾지 못했어요') || msg.includes('처음부터 다시')) {
          setExcludedPlaces([]);
          msg = '이미 모든 근처 장소를 추천해드렸어요. 더 넓은 범위에서 다시 검색할게요!';
        }
        setPiniError(msg);
        return;
      }

      const places: RecommendedPlace[] = await res.json();
      setPlace(places);

      // 누적 제외 목록 업데이트
      setExcludedPlaces(prev => [
        ...prev,
        ...places.map((p) => p.placeName)
      ]);
    } catch {
      setPiniError('네트워크 오류가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setPiniLoading(false);
    }
  }

  function handleSelectPlace(place: RecommendedPlace) {
    setSelectPlace(place);
  }

  function handleConfirmPlace() {
    if (!selectedPlace || !selectedPlace.placeId) return;
    setShowDateModal(true);
  }

  async function handleScheduleCreate(data: {
    title: string;
    scheduledAt: string;
    memo: string;
  }) {
    if (!selectedPlace || !selectedPlace.placeId) return;
    setIsScheduleSubmitting(true);
    setScheduleCreateError(null);
    try {
      const { id } = await createSchedule({
        roomCode,
        title: data.title,
        placeName: selectedPlace.placeName,
        placeAddress: selectedPlace.placeAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        scheduledAt: data.scheduledAt,
        memo: data.memo,
      });
      setSchedule({
        scheduleId: id,
        roomCode,
        placeName: selectedPlace.placeName,
        placeAddress: selectedPlace.placeAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        title: data.title,
        scheduledAt: data.scheduledAt,
        memo: data.memo,
      });
      setPiniOpen(false);
      setShowDateModal(false);
      router.push(`/calendar/${id}`);
    } catch {
      setScheduleCreateError("일정 저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsScheduleSubmitting(false);
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRerun() {
    clearMap();
    handleRunPini();
  }

  function handleResetPlace() {
    setLocationSaved(false);
    clearMap();
    setExcludedPlaces([]);  // 선호 바꾸면 제외 목록도 초기화
  }

  // 날짜 저장 — WaitingParticipantCenter에서 호출
  async function handleSaveDates() {
    setDateError(null);
    const result = await saveAvailableDates(roomCode, myDates);
    if (!result.ok) { setDateError(result.reason ?? "날짜 저장에 실패했어요"); return; }
    setDateSaved(true);
  }

  async function handleExtend() {
    try {
      await extendRoomLink(roomCode);
      const newExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      setLinkExpiresAt(newExpiry);
      setShowLinkSheet(false);
    } catch {
      // 실패해도 시트는 열린 채 유지해 재시도 가능하게 함
    }
  }

  /* ── Confirmed view ── */
  if (isDone && scheduleInfo) {
    return (
      <>
        {/* Slim context header */}
        <header className="flex items-center justify-between px-6 lg:px-10 h-14 border-b border-hairline shrink-0">
          <Badge variant="success" dot>
            모임 확정됨
          </Badge>
          <Badge variant="muted">{roomCode}</Badge>
        </header>
        <ScheduleView
          placeName={scheduleInfo.placeName}
          placeAddress={scheduleInfo.placeAddress}
          roomCode={roomCode}
          onReset={() => router.push("/rooms/create")}
          participants={participants}
          currentUserId={currentUserId}
          lat={scheduleInfo.lat}
          lng={scheduleInfo.lng}
        />
      </>
    );
  }

  /* ── Active session view ── */
  return (
    <>
      {/* ── Context header — spans the content area, not the sidebar ── */}
      <header className="flex items-center justify-between px-6 lg:px-8 h-14 border-b border-hairline shrink-0 bg-surface">
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[12px] font-medium text-ink-subtle">
            모임 대기실
          </span>
          <div className="hidden sm:block w-px h-4 bg-hairline" />
          <Badge variant={allReady ? "success" : "warning"} dot>
            {allReady ? "모두 준비됨" : "대기 중"}
          </Badge>
        </div>
        <button
          onClick={() => setShowLinkSheet(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-hairline rounded-full
                     text-[13px] font-semibold text-ink-muted
                     hover:border-hairline-strong hover:bg-surface-2 transition-colors"
        >
          <span className="font-mono tracking-wider text-ink">{roomCode}</span>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-ink-subtle"><path d="M5.5 8.5l3-3M3.5 9L2 10.5A2 2 0 104.5 13L6 11.5M8 5l1.5-1.5A2 2 0 1112 6.5L10.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      </header>

      {/*
        ── Two-pane grid ──────────────────────────────────────────────
        The grid-template-columns transition is the core desktop mechanic.

        `grid-template-columns` is animatable between equal-track-count
        values in Chromium 107+, Firefox 101+, Safari 16+.

        The inline `transition` style targets exactly the grid property
        with an expo-out easing. Tailwind arbitrary-transition syntax
        would also work: `transition-[grid-template-columns]`, but inline
        style keeps the easing string readable.

        On mobile (< lg): grid collapses to a single column; the right
        pane is hidden, and the mobile bottom sheet handles PINI.
      */}
      {/*
        ── Two-pane layout ─────────────────────────────────────────────
        Mobile: flex flex-col (single column). grid-cols only applies at lg+.
        Using flex on mobile avoids CSS Grid's implicit track creation which
        was producing a ~15 px left column on iOS when grid-cols was absent.

        Desktop: switches to grid so grid-template-columns can be animated
        between hasResults states (expo-out easing).
      */}
      <div
        className={[
          "flex-1 flex flex-col overflow-hidden min-h-0",
          hasResults
            ? "lg:grid lg:grid-cols-[360px_1fr]"
            : "lg:grid lg:grid-cols-[1fr_360px]",
        ].join(" ")}
        style={{
          transition:
            "grid-template-columns 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ── Left pane ─────────────────────────────────────────────── */}
        {/* flex-1 fills the flex-col parent on mobile; ignored by grid on desktop */}
        <div className="flex-1  min-w-0  flex flex-col overflow-y-auto lg:border-r border-hairline pb-36 lg:pb-0">
          {/* 재선정 배너 — 호스트는 이미 장소를 고르는 중이므로 참가자에게만 표시 */}
          {roomStatus === "reselecting" && !isHost && (
            <div className="mx-6 lg:mx-10 mt-6 px-4 py-3 rounded-xl bg-warning-bg-alt border border-warning-border flex items-start gap-3">
              <span className="text-warning-orange shrink-0 mt-0.5" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1l1.5 5.5L16 8l-5.5 1.5L9 15l-1.5-5.5L2 8l5.5-1.5L9 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <p className="text-[13px] font-semibold text-warning-text">호스트가 새 장소를 고르고 있어요</p>
                <p className="text-[12px] text-warning-amber mt-0.5">잠시 후 새로운 장소가 확정되면 알림을 받게 돼요.</p>
              </div>
            </div>
          )}
          {/* Content changes based on whether results have arrived */}
          {hasResults ? (
            /* ── Room summary (after results) ── */
            <RoomSummaryPane
              participants={participants}
              locationSaved={locationSaved}
              readyCount={readyCount}
              totalCount={totalCount}
              selectedPlaceName={
                selectedPlace && selectedPlace.placeId ? selectedPlace.placeName : null
              }
              onConfirm={selectedPlace && selectedPlace.placeId ? handleConfirmPlace : undefined}
              onRerun={handleRerun}
              currentUserId={currentUserId}
              onResetPreference={handleResetPlace}
            />
          ) : (
            /* ── 대기실 (before results) ── */
            <div className="px-6 lg:px-10 py-8 lg:py-10">

              {/* 모바일 전용: 참가자 목록 (데스크톱은 WaitingParticipantSidebar에서 표시) */}
              <div className="lg:hidden mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase">
                    참가자
                  </p>
                  <span className="text-[11px] font-medium text-ink-subtle">
                    {readyCount}/{totalCount}명 준비 완료
                  </span>
                </div>
                <div className="space-y-2">
                  {isLoading
                    ? /* Skeleton while joinRoom + getParticipants resolve */
                    [0, 1].map((i) => (
                      <div
                        key={i}
                        className="h-12 rounded-xl bg-surface-3 animate-pulse"
                      />
                    ))
                    : participants.map((p, idx) => (
                      <ParticipantCard
                        key={p.id}
                        nickname={p.user.nickname}
                        isHost={p.isHost}
                        abstractLocation={
                          isMe(p)
                            ? locationSaved
                              ? myLocation
                              : undefined
                            : (p.abstractLocation ?? undefined)
                        }
                        transports={
                          isMe(p)
                            ? locationSaved && myTransports
                              ? [myTransports]
                              : []
                            : (p.transports as Transport[])
                        }
                        isReady={
                          isMe(p)
                            ? locationSaved
                            : Boolean(p.abstractLocation)
                        }
                        isMe={isMe(p)}
                        animationDelay={`${idx * 0.06}s`}
                        profileImage={p.user.profileImage}
                      />
                    ))}
                </div>
                <div className="h-px bg-hairline mt-8" />
              </div>

              {/* 메인 액션 영역 — 선호 미입력 / 호스트 / 참가자 분기 */}
              {!locationSaved ? (
                /* 선호 미입력 시 — preferences 페이지로 이동 */
                <div
                  className="flex flex-col items-center gap-4 py-6 px-4 bg-surface rounded-2xl border border-hairline mt-0 lg:mt-6"
                  style={{ animation: "fade-up 0.4s ease-out both" }}
                >
                  <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                      <path d="M11 2C7.68 2 5 4.68 5 8c0 4.67 6 12 6 12s6-7.33 6-12c0-3.32-2.68-6-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="11" cy="8" r="2" stroke="currentColor" strokeWidth="1.6"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-ink mb-1">
                      아직 선호를 입력하지 않았어요
                    </p>
                    <p className="text-[12px] text-ink-subtle leading-relaxed">
                      출발지, 이동수단, 분위기 선호를 입력하면<br />피니가 최적 장소를 찾아드려요
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push(`/rooms/${roomCode}/preferences`)}
                  >
                    선호 입력하러 가기
                  </Button>
                </div>
              ) : isHost ? (
                /* 호스트 전용 대기 패널 */
                <WaitingHostCenter
                  readyCount={readyCount}
                  totalCount={totalCount}
                  allReady={allReady}
                  progress={readyProgress}
                  onRunPini={handleRunPini}
                  onResetPreference={handleResetPlace}
                />
              ) : (
                /* 참가자 전용 대기 패널 */
                <WaitingParticipantCenter
                  myDates={myDates}
                  dateSaved={dateSaved}
                  dateError={dateError}
                  onChangeDates={setMyDates}
                  onSaveDates={handleSaveDates}
                  onResetDates={() => setDateSaved(false)}
                  onResetPreference={handleResetPlace}
                />
              )}

              {/* 모바일 전용: 선호 미입력 상태에서 대기 중인 참가자 힌트 */}
              {!locationSaved && !allReady && (() => {
                const notReady = participants.filter((p) =>
                  p.userId === currentUserId ? !locationSaved : !p.abstractLocation
                );
                const names = notReady.map((p) => p.user.nickname);
                const nameText =
                  names.length === 1
                    ? `${names[0]}님`
                    : `${names.slice(0, -1).join("님, ")}님, ${names.at(-1)}님`;
                return (
                  <div className="flex mt-4 items-center gap-3 p-4 bg-surface rounded-xl border border-hairline">
                    <span className="text-ink-muted" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 2h12M4 18h12M6 2v4l4 4-4 4v4M14 2v4l-4 4 4 4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink-muted">
                        참가자 대기 중
                      </p>
                      <p className="text-[12px] text-ink-subtle">
                        {nameText}이 입력하면 PINI를 실행할 수 있어요
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}
        </div>

        {/* ── Right pane — desktop only ─────────────────────────────── */}
        <div className="hidden lg:block overflow-hidden">
          {hasResults ? (
            /*
             * PINI inline results pane — variant="inline" means no
             * backdrop, no fixed positioning. Fills this grid cell entirely.
             * The PiniPanel reads its own internal loading/done state
             * from the isLoading + places props.
             */
            <PiniPanel
              variant="inline"
              open
              onClose={() => { }}
              places={piniPlaces}
              selectedPlaceId={selectedPlace?.placeId ?? null}
              onSelectPlace={handleSelectPlace}
              onRegenerate={handleRerun}
              onConfirm={selectedPlace?.placeId ? handleConfirmPlace : undefined}
              isLoading={piniLoading}
              error={piniError}
              participantCount={participants.length}
            />
          ) : (
            /*
             * 참가자 목록 사이드바 — PINI 결과 도착 전 참가자 준비 현황 표시.
             * WaitingParticipantSidebar가 PiniAmbientSidebar를 대체.
             */
            <WaitingParticipantSidebar
              participants={participants}
              currentUserId={currentUserId}
              locationSaved={locationSaved}
              readyCount={readyCount}
              totalCount={totalCount}
              progress={readyProgress}
              allReady={allReady}
              onShowInvite={() => setShowLinkSheet(true)}
            />
          )}
        </div>
      </div>

      {/* ── Mobile: sticky bottom CTA ─────────────────────────────── */}
      {/*
        pointer-events-none on the outer gradient div prevents the
        visually-transparent top portion of the gradient from blocking
        touch events on form elements underneath (iOS Safari issue).
        pointer-events-auto is restored on the actual interactive content.
      */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-5 pb-5 bg-linear-to-t from-canvas from-80% to-transparent pt-4 pointer-events-none">
        {isHost ? (
          <div
            className="rounded-[10px] overflow-hidden pointer-events-auto"
            style={
              allReady
                ? { animation: "cta-glow 2.4s ease-in-out infinite" }
                : undefined
            }
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!allReady}
              onClick={handleRunPini}
            >
              {allReady
                ? "PINI 실행하기"
                : `대기 중 (${readyCount}/${totalCount})`}
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 py-3.5 px-4 bg-surface rounded-xl border border-hairline pointer-events-auto"
            style={{ animation: "fade-up 0.3s ease-out both" }}
          >
            <div className="flex gap-[3px] shrink-0">
              {([0, 0.15, 0.3] as const).map((d) => (
                <div
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  style={{
                    animation: `dot-bounce 1.2s ease-in-out ${d}s infinite`,
                  }}
                />
              ))}
            </div>
            <p className="text-[13px] font-medium text-ink-muted">
              호스트가 장소 추천을 준비하고 있어요
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile: PINI bottom sheet — lg:hidden so it never ── */}
      {/* ── overlays the desktop inline pane                      ── */}
      <div className="lg:hidden">
        <PiniPanel
          variant="modal"
          open={piniOpen}
          onClose={() => setPiniOpen(false)}
          places={piniPlaces}
          selectedPlaceId={selectedPlace?.placeId ?? null}
          onSelectPlace={handleSelectPlace}
          onRegenerate={handleRerun}
          onConfirm={selectedPlace?.placeId ? handleConfirmPlace : undefined}
          isLoading={piniLoading}
          error={piniError}
          participantCount={participants.length}
        />
      </div>

      {/* ── Date / time modal — shown after place selection ── */}
      {showDateModal && selectedPlace && selectedPlace.placeId && (
        <ScheduleDateModal
          placeName={selectedPlace.placeName}
          placeAddress={selectedPlace.placeAddress}
          onSubmit={handleScheduleCreate}
          isSubmitting={isScheduleSubmitting}
          submitError={scheduleCreateError}
          onCancel={() => setShowDateModal(false)}
          roomCode={roomCode}
        />
      )}

      {/* ── Room link sheet ── */}
      {showLinkSheet && (
        <RoomLinkSheet
          roomCode={roomCode}
          expiresAt={linkExpiresAt}
          isHost={isHost}
          onCopy={handleCopyCode}
          copied={copied}
          onExtend={handleExtend}
          onClose={() => setShowLinkSheet(false)}
        />
      )}
    </>
  );
}
