"use client";

/**
 * Room page — cinematic desktop layout with persistent grid transition
 *
 * ── Why no modal on desktop ──────────────────────────────────────────
 * The previous SherlockPanel was a fixed overlay (z-50 backdrop + centred
 * dialog). On a 1440 px screen that means the product's most important
 * moment — the recommendation — played inside a ~768 px window with
 * ~336 px of unused space on each side. The result felt spatially weak.
 *
 * The fix: the page OWNS two persistent panes. When Sherlock results
 * arrive, the grid transition swaps which pane is wide and which is
 * narrow. No modal, no backdrop, no z-index stacking.
 *
 * ── Grid transition ──────────────────────────────────────────────────
 *
 *   BEFORE results  lg:grid-cols-[1fr_360px]
 *     [ participant / preference area ] [ sherlock ambient sidebar ]
 *
 *   AFTER results   lg:grid-cols-[360px_1fr]
 *     [ room summary ] [ full sherlock results pane ← owns the space ]
 *
 * The transition is driven by `hasResults = sherlockLoading || places.length > 0`.
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
 *   sherlockLoading                                    — async flag
 *   sherlockOpen                                       — MOBILE ONLY, controls bottom sheet
 *   copied                                             — clipboard feedback
 *
 * GLOBAL (Zustand — also read by AppSidebar):
 *   useMapStore    recommendedPlaces, selectedPlace
 *   useScheduleStore  scheduleInfo
 *
 * The sidebar (AppSidebar) derives its phase label from the same Zustand
 * stores, so it stays in sync without any prop drilling.
 */

import { useState, useEffect } from "react";
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
import { SherlockPanel } from "@/app/components/SherlockPanel";
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
import { extendRoomLink, validateRoom } from "@/app/actions/rooms";

/* ── Inferred type from server action ────────────────────────────────── */

type ParticipantWithUser = Awaited<
  ReturnType<typeof getParticipants>
>["participants"][number];

const MOCK_PLACES: RecommendedPlace[] = [
  {
    placeId: "p1",
    placeName: "홍콩반점0410 강남점",
    placeAddress: "서울 강남구 테헤란로 142",
    category: "restaurant" as Category,
    rating: 4.8,
    lat: 37.5012,
    lng: 127.039,
    fairnessScore: 94,
    balanceTag: "most_balanced",
    reasoning:
      "세 분의 이동 시간 차이가 4분 이내예요. 대중교통으로도 접근성이 좋고, 조용한 분위기 선호 2명과 일치해요.",
    atmosphereMatch: "조용한 분위기 선호 2명 일치",
    perParticipantTime: [
      { nickname: "박해림", minutes: 17, transport: "transit" },
      { nickname: "김철수", minutes: 19, transport: "walk" },
      { nickname: "이영희", minutes: 21, transport: "transit" },
    ],
    reviewIntelligence: {
      authenticCount: 124,
      pros: [
        "조용해서 대화하기 좋아요",
        "음식이 일관되게 맛있어요",
        "자리 여유가 있는 편이에요",
      ],
      cons: ["점심 시간대는 기다릴 수 있어요"],
    },
  },
  {
    placeId: "p2",
    placeName: "블루보틀 커피 삼청점",
    placeAddress: "서울 종로구 삼청로 100",
    category: "cafe" as Category,
    rating: 4.6,
    lat: 37.5825,
    lng: 126.9822,
    fairnessScore: 87,
    balanceTag: "review_pick",
    reasoning:
      "세 분 모두 조용하고 아늑한 분위기를 선호하셨어요. 실제 방문자 후기도 일관되게 긍정적이에요.",
    atmosphereMatch: "분위기 선호 3명 모두 일치",
    perParticipantTime: [
      { nickname: "박해림", minutes: 24, transport: "transit" },
      { nickname: "김철수", minutes: 22, transport: "walk" },
      { nickname: "이영희", minutes: 20, transport: "transit" },
    ],
    reviewIntelligence: {
      authenticCount: 87,
      pros: [
        "감성적인 공간으로 오래 있기 좋아요",
        "커피 퀄리티가 뛰어나요",
        "직원이 친절하고 조용해요",
      ],
      cons: ["음료 가격이 다소 높아요", "주말 오후에는 자리 경쟁이 있어요"],
    },
  },
  {
    placeId: "p3",
    placeName: "이자카야 하나 서초점",
    placeAddress: "서울 서초구 서초대로 77",
    category: "bar" as Category,
    rating: 4.5,
    lat: 37.4967,
    lng: 127.0276,
    fairnessScore: 79,
    balanceTag: "closest_to_all",
    reasoning:
      "박해림님과 이영희님에게 가장 가까운 위치예요. 두 분의 이동 부담이 가장 적은 선택지예요.",
    atmosphereMatch: "아늑한 분위기 선호 1명 일치",
    perParticipantTime: [
      { nickname: "박해림", minutes: 14, transport: "transit" },
      { nickname: "김철수", minutes: 28, transport: "walk" },
      { nickname: "이영희", minutes: 15, transport: "transit" },
    ],
    reviewIntelligence: {
      authenticCount: 56,
      pros: ["분위기가 아늑하고 편안해요", "음식 퀄리티가 기대 이상이에요"],
      cons: ["공간이 좁아서 소규모 모임에 적합해요", "미리 예약하는 게 좋아요"],
    },
  },
];

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
}

function ScheduleView({
  placeName,
  placeAddress,
  roomCode,
  onReset,
  participants,
  currentUserId,
}: ScheduleViewProps) {
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
            <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              🗺 지도 보기
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-surface-3 text-ink-muted text-[13px] font-semibold hover:bg-hairline transition-colors">
              📋 복사
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
}

function RoomSummaryPane({
  participants,
  locationSaved,
  readyCount,
  totalCount,
  selectedPlaceName,
  onConfirm,
  onRerun,
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
    </div>
  );
}

/* ── Sherlock ambient sidebar — right side BEFORE results ────────────── */

interface SherlockAmbientSidebarProps {
  readonly readyCount: number;
  readonly totalCount: number;
  readonly participants: ParticipantWithUser[];
  readonly locationSaved: boolean;
  readonly allReady: boolean;
  readonly isCurrentUserHost: boolean;
  readonly onRunSherlock: () => void;
  readonly currentUserId: string | undefined;
}

function SherlockAmbientSidebar({
  readyCount,
  totalCount,
  participants,
  locationSaved,
  allReady,
  isCurrentUserHost,
  onRunSherlock,
  currentUserId,
}: SherlockAmbientSidebarProps) {
  return (
    <div className="h-full overflow-y-auto px-8 py-10 bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[15px] font-black text-ink tracking-tight mb-1.5">
          Sherlock 조율
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
              onClick={onRunSherlock}
            >
              {allReady
                ? "Sherlock 실행하기"
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
  const [myTransports, setMyTransports] = useState<Transport[]>([]);
  const [myDistance, setMyDistance] = useState<DistanceTolerance | null>(null);
  const [myAtmosphere, setMyAtmosphere] = useState<AtmospherePreference | null>(
    null,
  );
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /* ── Sherlock state ── */
  const [sherlockLoading, setSherlockLoading] = useState(false);
  /* sherlockOpen is ONLY used for the mobile bottom-sheet variant */
  const [sherlockOpen, setSherlockOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── Date modal state ── */
  const [showDateModal, setShowDateModal] = useState(false);
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);

  /* ── Zustand ── */
  const sherlockPlaces = useMapStore((s) => s.recommendedPlaces);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  const currentUserId = useUserStore((s) => s.userInfo?.myId);
  const isMe = (p: ParticipantWithUser) => p.userId === currentUserId;
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function participant() {
      const { isHost: host, savedPreference, linkExpiresAt: expiry } = await joinRoom(roomCode);
      const { participants: fetchedParticipants } =
        await getParticipants(roomCode);

      setIsHost(host);
      setParticipants(fetchedParticipants);
      setLinkExpiresAt(expiry);  // joinRoom에서 바로 세팅 → 시트 즉시 표시 가능

      // 새로고침해도 이전에 저장한 선호 복원
      if (savedPreference) {
        setMyLocation(savedPreference.abstractLocation);
        setMyTransports(savedPreference.transports as Transport[]);
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

      setIsLoading(false);
    }

    participant();

    async function checkAndWatch() {
      // 방이 존재하는지만 확인 (초대코드 만료 여부와 무관하게 기존 멤버는 접속 유지)
      const { exists } = await checkRoomExists(roomCode);

      if (!result.valid && !isExpired) {
        setIsExpired(true);
        useRoomStore.getState().removeActiveRoom(roomCode);
        return;
      }

      useRoomStore.getState().addActiveRoom(roomCode);
      setLinkExpiresAt(result.expiresAt!);

      // 3. 만료 시점 타이머 설정
      const remaining = new Date(result.expiresAt!).getTime() - Date.now();
      if (remaining > 0) {
        expiryTimerRef.current = setTimeout(() => {
        setIsExpired(true);
        useRoomStore.getState().removeActiveRoom(roomCode);
        }, remaining);
      } else {
        setIsExpired(true);
        useRoomStore.getState().removeActiveRoom(roomCode);
      }
    }

    if(isExpired) return;

    checkAndWatch();

    return () => {
      if(expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
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
   * True as soon as Sherlock fires (loading or done) so the pane expands
   * immediately, giving the user a spatial cue that results are coming.
   */
  const hasResults = sherlockLoading || sherlockPlaces.length > 0;

  /* ── Handlers ── */

  async function handleSaveLocation() {
    if (!myLocation.trim()) {
      setLocationError("지역명을 입력해주세요");
      return;
    }
    if (myTransports.length === 0) {
      setLocationError("교통수단을 하나 이상 선택해주세요");
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
      transports: myTransports,
      distanceTolerance: myDistance ?? undefined,
      atmospherePreference: myAtmosphere ?? undefined,
    });
    setLocationSaved(true);
  }

  async function handleRunSherlock() {
    /* Open mobile sheet; desktop grid handles itself via hasResults */
    setSherlockOpen(true);
    setSherlockLoading(true);
    clearMap();
    await new Promise((r) => setTimeout(r, 3500));
    setPlace(MOCK_PLACES);
    setSherlockLoading(false);
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
    setSherlockOpen(false);
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
    setSherlockLoading(false);
    setSherlockOpen(false);
    handleRunSherlock();
  }

  async function handleExtend() {
    await extendRoomLink(roomCode, isHost);
    const newExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    setLinkExpiresAt(newExpiry);
    setIsExpired(false);
    setShowLinkSheet(false);

    // 타이머 재설정
    if(expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
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
        pane is hidden, and the mobile bottom sheet handles Sherlock.
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
            />
          ) : (
            /* ── Participant preferences (before results) ── */
            <div className="px-6 lg:px-10 py-8 lg:py-10">
              <div className="w-full max-w-xl lg:max-w-2xl mx-auto">
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
                                ? locationSaved
                                  ? myTransports
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
                          이동 가능한 교통수단
                        </label>
                        <span className="text-[10px] text-ink-tertiary">
                          여러 개 선택 가능
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
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A7A35]">
                        선호가 저장됐어요!
                      </p>
                      <p className="text-[12px] text-[#27A644]">
                        모든 참가자가 준비되면 Sherlock을 실행해요
                      </p>
                    </div>
                  </div>
                )}

                {/* Waiting hint */}
                {!allReady && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-hairline">
                    <span className="text-[20px]">⏳</span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink-muted">
                        참가자 대기 중
                      </p>
                      <p className="text-[12px] text-ink-subtle">
                        이영희님이 입력하면 Sherlock을 실행할 수 있어요
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right pane — desktop only ─────────────────────────────── */}
        <div className="hidden lg:block overflow-hidden">
          {hasResults ? (
            /*
             * Sherlock inline results pane — variant="inline" means no
             * backdrop, no fixed positioning. Fills this grid cell entirely.
             * The SherlockPanel reads its own internal loading/done state
             * from the isLoading + places props.
             */
            <SherlockPanel
              variant="inline"
              open
              onClose={() => {}}
              places={sherlockPlaces}
              selectedPlaceId={selectedPlace.placeId}
              onSelectPlace={handleSelectPlace}
              onRegenerate={handleRerun}
              onConfirm={selectedPlace.placeId ? handleConfirmPlace : undefined}
              isLoading={sherlockLoading}
              participantCount={participants.length}
            />
          ) : (
            /*
             * Sherlock ambient sidebar — shows participant readiness and
             * the host CTA before any results have been requested.
             */
            <SherlockAmbientSidebar
              readyCount={readyCount}
              totalCount={totalCount}
              participants={participants}
              locationSaved={locationSaved}
              allReady={allReady}
              isCurrentUserHost={isHost}
              onRunSherlock={handleRunSherlock}
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
              onClick={handleRunSherlock}
            >
              {allReady
                ? "Sherlock 실행하기"
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

      {/* ── Mobile: Sherlock bottom sheet — lg:hidden so it never ── */}
      {/* ── overlays the desktop inline pane                      ── */}
      <div className="lg:hidden">
        <SherlockPanel
          variant="modal"
          open={sherlockOpen}
          onClose={() => setSherlockOpen(false)}
          places={sherlockPlaces}
          selectedPlaceId={selectedPlace.placeId}
          onSelectPlace={handleSelectPlace}
          onRegenerate={handleRerun}
          onConfirm={selectedPlace.placeId ? handleConfirmPlace : undefined}
          isLoading={sherlockLoading}
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
