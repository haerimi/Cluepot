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

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ScheduleDateModal } from "./_components/ScheduleDateModal";
import {
  Transport,
  DistanceTolerance,
  AtmospherePreference,
} from "@/types/participant";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { ParticipantCard } from "@/app/components/ParticipantCard";
import { TransportPicker } from "@/app/components/TransportPicker";
import { RecommendedPlace } from "@/types/recommendation";
import { PiniPanel } from "@/app/components/PiniPanel";
import { useMapStore } from "@/store/map";
import { useScheduleStore } from "@/store/schedule";
import { useRoomStore } from "@/store/room";
import {
  getParticipants,
  joinRoom,
  savePreference,
} from "@/app/actions/participant";
import { createSchedule, getScheduleByRoomCode } from "@/app/actions/schedule";
import { useUserStore } from "@/store/user";
import { extendRoomLink, checkRoomExists } from "@/app/actions/rooms";

/* ── Inferred type from server action ────────────────────────────────── */

type ParticipantWithUser = Awaited<
  ReturnType<typeof getParticipants>
>["participants"][number];

/* ── Picker option types ─────────────────────────────────────────────── */

interface DistanceOption {
  value: DistanceTolerance;
  label: string;
  emoji: string;
  desc: string;
}

interface AtmosphereOption {
  value: AtmospherePreference;
  label: string;
  emoji: string;
}

const DISTANCE_OPTIONS: DistanceOption[] = [
  { value: "short", label: "짧게", emoji: "⚡", desc: "15분 이내" },
  { value: "medium", label: "적당히", emoji: "🚶", desc: "30분 이내" },
  { value: "far", label: "상관없어요", emoji: "🗺", desc: "멀어도 OK" },
];

const ATMOSPHERE_OPTIONS: AtmosphereOption[] = [
  { value: "quiet", label: "조용한", emoji: "☕" },
  { value: "lively", label: "활기찬", emoji: "🎵" },
  { value: "cozy", label: "아늑한", emoji: "🕯" },
  { value: "trendy", label: "트렌디한", emoji: "✨" },
];

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
        <div className="w-16 h-16 rounded-full bg-[#E8F5EC] flex items-center justify-center text-[32px] mb-8">
          ✅
        </div>

        <h2 className="text-[28px] lg:text-[34px] font-black text-ink tracking-tight text-center mb-3">
          모임 장소가 확정됐어요!
        </h2>
        <p className="text-[14px] text-ink-subtle text-center mb-10 leading-relaxed">
          참가자들에게 장소를 공유해드릴게요
        </p>

        {/* Confirmed card */}
        <div className="w-full bg-white rounded-2xl border border-hairline shadow-md p-6 mb-6">
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
          <div className="h-px bg-[#F0EDE7] mb-5" />
          <div className="flex gap-2">
            <button
              onClick={() => window.open(handleViewMap(placeName, lat, lng), '_blank')}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              🗺 지도 보기
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              {copied ? "✓" : "📋"} 복사
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
                className="flex items-center gap-2 bg-white border border-hairline rounded-full px-3 py-1.5"
              >
                <div
                  className={[
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    p.userId === currentUserId
                      ? "bg-accent text-white"
                      : "bg-surface-3 text-ink-muted",
                  ].join(" ")}
                >
                  {p.user.nickname.charAt(0)}
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
    <div className="h-full overflow-y-auto px-6 lg:px-8 py-8 bg-[#FAF9F6] border-r border-hairline">
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
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    p.userId === currentUserId
                      ? "bg-accent text-white"
                      : "bg-surface-3 text-ink-muted",
                  ].join(" ")}
                >
                  {p.user.nickname.charAt(0)}
                </div>
                <span className="text-[13px] font-medium text-ink flex-1 truncate">
                  {p.user.nickname}
                </span>
                <span
                  className={[
                    "w-2 h-2 rounded-full shrink-0",
                    isReady ? "bg-[#27A644]" : "bg-[#D0CCC4]",
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

/* ── PINI ambient sidebar — right side BEFORE results ────────────── */

interface PiniAmbientSidebarProps {
  readonly readyCount: number;
  readonly totalCount: number;
  readonly participants: ParticipantWithUser[];
  readonly locationSaved: boolean;
  readonly allReady: boolean;
  readonly isCurrentUserHost: boolean;
  readonly onRunPini: () => void;
  readonly currentUserId: string | undefined;
}

function PiniAmbientSidebar({
  readyCount,
  totalCount,
  participants,
  locationSaved,
  allReady,
  isCurrentUserHost,
  onRunPini,
  currentUserId,
}: PiniAmbientSidebarProps) {
  return (
    <div className="h-full overflow-y-auto px-8 py-10 bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[15px] font-black text-ink tracking-tight mb-1.5">
          PINI 조율
        </h2>
        <p className="text-[12px] text-ink-subtle leading-relaxed">
          모든 참가자가 준비되면 공정한 장소를 찾아드려요
        </p>
      </div>

      <div className="h-px bg-hairline mb-7" />

      {/* Participant status */}
      <div className="space-y-3 mb-7">
        {participants.map((p) => {
          const isReady =
            p.userId === currentUserId
              ? locationSaved
              : Boolean(p.abstractLocation);
          return (
            <div key={p.id} className="flex items-center gap-3">
              <div
                className={[
                  "w-2 h-2 rounded-full shrink-0",
                  isReady ? "bg-[#27A644]" : "bg-[#D0CCC4]",
                ].join(" ")}
              />
              <span className="text-[13px] text-ink-muted font-medium flex-1">
                {p.user.nickname}
              </span>
              {p.isHost && (
                <span className="text-[10px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">
                  호스트
                </span>
              )}
              <span className="text-[11px] text-ink-subtle">
                {isReady ? "준비됨" : "대기 중"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-ink-subtle tracking-wide uppercase">
            준비 현황
          </span>
          <span className="text-[12px] font-semibold text-ink">
            {readyCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${(readyCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {isCurrentUserHost ? (
          <div
            className="rounded-[10px] overflow-hidden"
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
              onClick={onRunPini}
            >
              {allReady
                ? "PINI 실행하기"
                : `대기 중 (${readyCount}/${totalCount})`}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-3.5 px-4 bg-white rounded-xl border border-hairline">
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
              호스트가 준비하고 있어요
            </p>
          </div>
        )}
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
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8"
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
          <span className="text-[20px]">{copied ? "✓" : "📋"}</span>
        </button>
        {copied && (
          <p className="text-[12px] text-[#27A644] text-center font-medium mb-3">
            클립보드에 복사됐어요!
          </p>
        )}

        {/* Expiry info */}
        <div
          className={[
            "flex items-center gap-3 px-4 py-3 rounded-xl mb-5",
            warning ? "bg-[#FFF8E1]" : "bg-surface-3",
          ].join(" ")}
        >
          <span className="text-[18px] shrink-0">{warning ? "⚠️" : "⏰"}</span>
          <div>
            <p className="text-[10px] font-bold text-ink-subtle tracking-[1.5px] uppercase">
              링크 유효 시간
            </p>
            <p
              className={[
                "text-[13px] font-semibold",
                warning ? "text-[#E65100]" : "text-ink",
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
            className="w-full h-11 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-accent/90 transition-colors mb-3"
          >
            🔗 4시간 연장하기
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
  const [myTransports, setMyTransports] = useState<Transport | null>(null);
  const [myDistance, setMyDistance] = useState<DistanceTolerance | null>(null);
  const [myAtmosphere, setMyAtmosphere] = useState<AtmospherePreference | null>(
    null,
  );
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /* ── PINI state ── */
  const [piniLoading, setPiniLoading] = useState(false);
  /* piniOpen is ONLY used for the mobile bottom-sheet variant */
  const [piniOpen, setPiniOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── Date modal state ── */
  const [showDateModal, setShowDateModal] = useState(false);
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);

  /* ── Zustand ── */
  const piniPlaces = useMapStore((s) => s.recommendedPlaces);
  const selectedPlace = useMapStore((s) => s.selectedPlace);
  const setSelectPlace = useMapStore((s) => s.selectPlace);
  const setPlace = useMapStore((s) => s.setPlaces);
  const clearMap = useMapStore((s) => s.clearMap);

  const isDone = useScheduleStore(
    (s) => s.scheduleInfo !== null && s.scheduleInfo.roomCode === roomCode,
  );
  const scheduleInfo = useScheduleStore((s) => s.scheduleInfo);
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const [participants, setParticipants] = useState<ParticipantWithUser[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("waiting");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
  const [showLinkSheet, setShowLinkSheet] = useState(false);
  const [category, setCategory] = useState<string>('');

  const currentUserId = useUserStore((s) => s.userInfo?.myId);
  const isMe = (p: ParticipantWithUser) => p.userId === currentUserId;
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function participant() {
      const { isHost: host, savedPreference, linkExpiresAt: expiry, category: roomCategory, roomStatus: status } = await joinRoom(roomCode);
      const { participants: fetchedParticipants } =
        await getParticipants(roomCode);

      setIsHost(host);
      setParticipants(fetchedParticipants);
      setLinkExpiresAt(expiry);  // joinRoom에서 바로 세팅 → 시트 즉시 표시 가능
      setCategory(roomCategory);
      setRoomStatus(status);

      // 새로고침해도 이전에 저장한 선호 복원
      if (savedPreference) {
        setMyLocation(savedPreference.abstractLocation);
        setMyTransports((savedPreference.transports[0] as Transport) ?? null);
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

      const remaining = new Date(expiry).getTime() - Date.now();
      if (remaining <= 0) {
        setIsExpired(true);
      } else {
        expiryTimerRef.current = setTimeout(() => {
          setIsExpired(true);
        }, remaining);
      }

      setIsLoading(false);
    }

    async function checkAndWatch() {
      const { exists } = await checkRoomExists(roomCode);

      if (!exists) {
        useRoomStore.getState().removeActiveRoom(roomCode);
        router.push("/");
        return;
      }

      useRoomStore.getState().addActiveRoom(roomCode);
    }

    participant();
    checkAndWatch();

    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      useScheduleStore.getState().clearSchedule();
      useMapStore.getState().clearMap();
    };
  }, [roomCode, isExpired]);

  const readyCount = participants.filter((p) =>
    p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation),
  ).length;
  const totalCount = participants.length;
  const allReady = totalCount > 0 && readyCount === totalCount;
  /*

   * hasResults drives the grid transition.
   * True as soon as PINI fires (loading or done) so the pane expands
   * immediately, giving the user a spatial cue that results are coming.
   */
  const hasResults = piniLoading || piniPlaces.length > 0;

  // 이전 추천장소 제외
  const [excludedPlaces, setExcludedPlaces] = useState<string[]>([]);
  const [piniError, setPiniError] = useState<string | null>(null);
  /* ── Handlers ── */

  async function handleSaveLocation() {
    if (!myLocation.trim()) {
      setLocationError("지역명을 입력해주세요");
      return;
    }
    if (myTransports === null) {
      setLocationError("교통수단을 선택해주세요");
      return;
    }
    if (!myDistance) {
      setLocationError("이동 거리 선호를 선택해주세요");
      return;
    }
    if (!myAtmosphere) {
      setLocationError("분위기 선호를 선택해주세요");
      return;
    }
    setLocationError(null);

    await savePreference({
      roomCode,
      abstractLocation: myLocation,
      lat: 0,
      lng: 0,
      transports: myTransports ? [myTransports] : [],
      distanceTolerance: myDistance ?? undefined,
      atmospherePreference: myAtmosphere ?? undefined,
    });
    setLocationSaved(true);
  }

  async function handleRunPini() {
    /* Open mobile sheet; desktop grid handles itself via hasResults */
    setPiniOpen(true);
    setPiniLoading(true);
    setPiniError(null);
    clearMap();

    try {
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
              };
            }
            return {
              nickname: p.user.nickname,
              abstractLocation: p.abstractLocation ?? '',
              transports: p.transports,
              distanceTolerance: p.distanceTolerance ?? 'medium',
              atmospherePreference: p.atmospherePreference ?? 'quiet',
            };
          }),
          category,
          excludePlaces: excludedPlaces,   // server key와 일치
        })
      });

      if (!res.ok) {
        const body = await res.text();
        let msg = 'AI 추천 중 오류가 발생했어요.';
        try { msg = (JSON.parse(body) as { error?: string }).error ?? msg; } catch { /* ignore */ }
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
    if (!selectedPlace.placeId) return;
    setShowDateModal(true);
  }

  async function handleScheduleCreate(data: {
    title: string;
    scheduledAt: string;
    memo: string;
  }) {
    if (!selectedPlace.placeId) return;
    setIsScheduleSubmitting(true);

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

  async function handleExtend() {
    await extendRoomLink(roomCode, isHost);
    const newExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    setLinkExpiresAt(newExpiry);
    setIsExpired(false);
    setShowLinkSheet(false);

    // 타이머 재설정
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
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
          onReset={() => router.push("/room/create")}
          participants={participants}
          currentUserId={currentUserId}
          lat={scheduleInfo.lat}
          lng={scheduleInfo.lng}
        />
      </>
    );
  }

  /* ── Expired view ── */
  if (isExpired) {
    return (
      <>
        <header className="flex items-center justify-between px-6 lg:px-10 h-14 border-b border-hairline shrink-0">
          <Badge variant="warning" dot>링크 만료됨</Badge>
          <Badge variant="muted">{roomCode}</Badge>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          style={{ animation: "fade-up 0.4s ease-out both" }}>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[32px] mb-8">
            ⏰
          </div>

          <h2 className="text-[26px] lg:text-[32px] font-black text-ink tracking-tight mb-3">
            모임 링크가 만료됐어요
          </h2>

          {isHost ? (
            /* ── 호스트 ── */
            <>
              <p className="text-[14px] text-ink-subtle leading-relaxed mb-10 max-w-[320px]">
                링크 유효 시간이 지났어요.<br />연장하면 참가자들이 다시 입장할 수 있어요.
              </p>
              <Button variant="primary" size="lg" onClick={handleExtend}>
                4시간 연장하기
              </Button>
              <button
                onClick={() => router.push("/")}
                className="mt-4 text-[13px] text-ink-subtle hover:text-ink transition-colors"
              >
                홈으로 돌아가기
              </button>
            </>
          ) : (
            /* ── 참가자 ── */
            <>
              <p className="text-[14px] text-ink-subtle leading-relaxed mb-10 max-w-[320px]">
                호스트가 링크를 연장하면<br />자동으로 다시 입장할 수 있어요.
              </p>
              <div className="flex items-center gap-3 py-3.5 px-5 bg-white rounded-xl border border-hairline">
                <div className="flex gap-[3px] shrink-0">
                  {([0, 0.15, 0.3] as const).map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
                <p className="text-[13px] font-medium text-ink-muted">
                  호스트 연장 대기 중
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="mt-6 text-[13px] text-ink-subtle hover:text-ink transition-colors"
              >
                홈으로 돌아가기
              </button>
            </>
          )}
        </div>
      </>
    );
  }

  /* ── Active session view ── */
  return (
    <>
      {/* ── Context header — spans the content area, not the sidebar ── */}
      <header className="flex items-center justify-between px-6 lg:px-8 h-14 border-b border-hairline shrink-0 bg-[#FAF9F6]">
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-hairline rounded-full
                     text-[13px] font-semibold text-ink-muted
                     hover:border-hairline-strong hover:bg-surface-3 transition-colors"
        >
          <span className="font-mono tracking-wider text-ink">{roomCode}</span>
          <span className="text-ink-subtle">🔗</span>
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
            <div className="mx-6 lg:mx-10 mt-6 px-4 py-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3">
              <span className="text-[18px] shrink-0 mt-0.5">✨</span>
              <div>
                <p className="text-[13px] font-semibold text-[#92400E]">호스트가 새 장소를 고르고 있어요</p>
                <p className="text-[12px] text-[#B45309] mt-0.5">잠시 후 새로운 장소가 확정되면 알림을 받게 돼요.</p>
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
                selectedPlace.placeId ? selectedPlace.placeName : null
              }
              onConfirm={selectedPlace.placeId ? handleConfirmPlace : undefined}
              onRerun={handleRerun}
              currentUserId={currentUserId}
              onResetPreference={handleResetPlace}
            />
          ) : (
            /* ── Participant preferences (before results) ── */
            <div className="px-6 lg:px-10 py-8 lg:py-10">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Participants */}
                <div className="mb-8">
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
                        />
                      ))}
                  </div>
                </div>

                <div className="h-px bg-hairline mb-8" />

                {/* Preference form */}
                {!locationSaved && (
                  <div style={{ animation: "fade-up 0.4s ease-out both" }}>
                    <p className="text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-6">
                      내 정보 알려주기
                    </p>

                    {/* Location */}
                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-3">
                        출발 지역
                      </label>
                      <input
                        type="text"
                        value={myLocation}
                        onChange={(e) => {
                          setMyLocation(e.target.value);
                          setLocationError(null);
                        }}
                        placeholder="예: 강남구, 홍대, 잠실"
                        className={[
                          "w-full h-12 px-4 rounded-xl border text-[15px]",
                          "placeholder:text-ink-tertiary",
                          "outline-none transition-all duration-150",
                          "focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent",
                          locationError
                            ? "border-[#DC2626] bg-[#FEF2F2]"
                            : "border-hairline bg-canvas focus:bg-white",
                        ].join(" ")}
                      />
                    </div>

                    {/* Transport */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase">
                          이동 수단
                        </label>
                        <span className="text-[10px] text-ink-tertiary">
                          오늘 이용할 수단 하나
                        </span>
                      </div>
                      <TransportPicker
                        value={myTransports}
                        onChange={setMyTransports}
                      />
                    </div>

                    {/* Distance */}
                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-3">
                        이동 거리 선호
                      </label>
                      <div className="flex gap-2">
                        {DISTANCE_OPTIONS.map((opt) => {
                          const sel = myDistance === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setMyDistance(opt.value);
                                setLocationError(null);
                              }}
                              className={[
                                "flex flex-col items-center gap-1 flex-1 py-3 rounded-[10px] border text-center transition-all duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                                sel
                                  ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7C5CFC]"
                                  : "bg-canvas border-hairline hover:border-hairline-strong hover:bg-surface-2",
                              ].join(" ")}
                            >
                              <span className="text-xl leading-none">
                                {opt.emoji}
                              </span>
                              <span
                                className={[
                                  "text-[11px] font-semibold leading-tight mt-0.5",
                                  sel ? "text-accent" : "text-ink-muted",
                                ].join(" ")}
                              >
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-ink-subtle">
                                {opt.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Atmosphere */}
                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-3">
                        선호 분위기
                      </label>
                      <div className="flex gap-2">
                        {ATMOSPHERE_OPTIONS.map((opt) => {
                          const sel = myAtmosphere === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setMyAtmosphere(opt.value);
                                setLocationError(null);
                              }}
                              className={[
                                "flex flex-col items-center gap-1 flex-1 py-3 rounded-[10px] border text-center transition-all duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                                sel
                                  ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7C5CFC]"
                                  : "bg-canvas border-hairline hover:border-hairline-strong hover:bg-surface-2",
                              ].join(" ")}
                            >
                              <span className="text-xl leading-none">
                                {opt.emoji}
                              </span>
                              <span
                                className={[
                                  "text-[11px] font-semibold leading-tight mt-0.5",
                                  sel ? "text-accent" : "text-ink-muted",
                                ].join(" ")}
                              >
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {locationError && (
                      <div className="flex items-center gap-2 mb-5">
                        <span className="text-[#DC2626] text-[13px]">⚠️</span>
                        <p className="text-[12px] text-[#DC2626]">
                          {locationError}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={handleSaveLocation}
                      className="mb-2"
                    >
                      선호 저장하기
                    </Button>
                  </div>
                )}

                {/* Saved confirmation */}
                {locationSaved && (
                  <div
                    className="flex items-center gap-3 p-4 bg-[#E8F5EC] rounded-xl border border-[#27A644]/20 mb-6"
                    style={{ animation: "fade-up 0.3s ease-out both" }}
                  >
                    <span className="text-[20px]">✅</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-[#1A7A35]">
                        선호가 저장됐어요!
                      </p>
                      <p className="text-[12px] text-[#27A644]">
                        모든 참가자가 준비되면 PINI를 실행해요
                      </p>
                    </div>
                    <button
                      onClick={handleResetPlace}
                      className="ml-auto text-[12px] text-[#1A7A35] underline underline-offset-2 shrink-0"
                    >
                      수정
                    </button>
                  </div>
                )}

                {/* Waiting hint */}
                {!allReady && (() => {
                  const notReady = participants.filter((p) =>
                    p.userId === currentUserId ? !locationSaved : !p.abstractLocation
                  );
                  const names = notReady.map((p) => p.user.nickname);
                  const nameText =
                    names.length === 1
                      ? `${names[0]}님`
                      : `${names.slice(0, -1).join("님, ")}님, ${names.at(-1)}님`;

                  return (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-hairline">
                      <span className="text-[20px]">⏳</span>
                      <div>
                        <p className="text-[13px] font-semibold text-ink-muted">
                          참가자 대기 중
                        </p>
                        <p className="text-[12px] text-ink-subtle gap-3">
                          {nameText}이 입력하면 PINI를 실행할 수 있어요
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
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
              selectedPlaceId={selectedPlace.placeId}
              onSelectPlace={handleSelectPlace}
              onRegenerate={handleRerun}
              onConfirm={selectedPlace.placeId ? handleConfirmPlace : undefined}
              isLoading={piniLoading}
              error={piniError}
              participantCount={participants.length}
            />
          ) : (
            /*
             * PINI ambient sidebar — shows participant readiness and
             * the host CTA before any results have been requested.
             */
            <PiniAmbientSidebar
              readyCount={readyCount}
              totalCount={totalCount}
              participants={participants}
              locationSaved={locationSaved}
              allReady={allReady}
              isCurrentUserHost={isHost}
              onRunPini={handleRunPini}
              currentUserId={currentUserId}
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
            className="flex items-center gap-3 py-3.5 px-4 bg-white rounded-xl border border-hairline pointer-events-auto"
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
          selectedPlaceId={selectedPlace.placeId}
          onSelectPlace={handleSelectPlace}
          onRegenerate={handleRerun}
          onConfirm={selectedPlace.placeId ? handleConfirmPlace : undefined}
          isLoading={piniLoading}
          error={piniError}
          participantCount={participants.length}
        />
      </div>

      {/* ── Date / time modal — shown after place selection ── */}
      {showDateModal && selectedPlace.placeId && (
        <ScheduleDateModal
          placeName={selectedPlace.placeName}
          placeAddress={selectedPlace.placeAddress}
          onSubmit={handleScheduleCreate}
          isSubmitting={isScheduleSubmitting}
          onCancel={() => setShowDateModal(false)}
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
