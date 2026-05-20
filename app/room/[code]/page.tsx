"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Transport, DistanceTolerance, AtmospherePreference } from "@/types/participant";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { ParticipantCard } from "@/app/components/ParticipantCard";
import { TransportPicker } from "@/app/components/TransportPicker";
import { RecommendedPlace } from "@/types/recommendation";
import { SherlockPanel } from "@/app/components/SherlockPanel";

/* ── Mock data ── */
interface MockParticipant {
  id: string;
  nickname: string;
  isHost: boolean;
  abstractLocation: string | null;
  transports: Transport[];
  isMe?: boolean;
}

const MOCK_PARTICIPANTS: MockParticipant[] = [
  {
    id: "1",
    nickname: "박해림",
    isHost: true,
    abstractLocation: "강남구",
    transports: ["transit"],
    isMe: true,
  },
  {
    id: "2",
    nickname: "김철수",
    isHost: false,
    abstractLocation: "마포구",
    transports: ["walk", "transit"],
  },
  {
    id: "3",
    nickname: "이영희",
    isHost: false,
    abstractLocation: null,
    transports: [],
  },
];

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

/* ── Picker option types ── */
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

type RoomView = "waiting" | "done";

/* ── Schedule Confirmed View ── */
function ScheduleView({
  placeName,
  placeAddress,
  roomCode,
  onReset,
}: {
  placeName: string;
  placeAddress: string;
  roomCode: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-5 pt-12 pb-8 flex-1">
      <div className="w-20 h-20 rounded-full bg-[#E8F5EC] flex items-center justify-center text-[40px] mb-6">
        ✅
      </div>
      <h2 className="text-[24px] font-black text-[#1C1A17] tracking-tight text-center mb-2">
        모임 장소가 확정됐어요!
      </h2>
      <p className="text-[14px] text-[#908D87] text-center mb-10">
        참가자들에게 장소를 공유해드릴게요
      </p>

      {/* Confirmed place card */}
      <div className="w-full bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_4px_12px_rgba(28,26,23,0.08)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="success" dot>확정</Badge>
          <Badge variant="muted">모임 {roomCode}</Badge>
        </div>
        <h3 className="text-[20px] font-black text-[#1C1A17] tracking-tight mb-1">
          {placeName}
        </h3>
        <p className="text-[13px] text-[#908D87] mb-4">{placeAddress}</p>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-[#F0EDE7] text-[#4A4740] text-[13px] font-semibold hover:bg-[#E5E1D9] transition-colors">
            🗺 지도 보기
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-[#F0EDE7] text-[#4A4740] text-[13px] font-semibold hover:bg-[#E5E1D9] transition-colors">
            📋 복사
          </button>
        </div>
      </div>

      {/* Participants confirmed */}
      <div className="w-full mb-10">
        <p className="text-[12px] font-semibold text-[#908D87] tracking-widest uppercase mb-3">
          참가자 확인
        </p>
        <div className="flex gap-2 flex-wrap">
          {MOCK_PARTICIPANTS.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-white border border-[#E5E1D9] rounded-full px-3 py-1.5"
            >
              <div
                className={[
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  p.isMe ? "bg-[#7C5CFC] text-white" : "bg-[#F0EDE7] text-[#4A4740]",
                ].join(" ")}
              >
                {p.nickname.charAt(0)}
              </div>
              <span className="text-[12px] font-medium text-[#1C1A17]">
                {p.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 w-full">
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
  );
}

/* ── Main Room Page ── */
export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.code as string ?? "").toUpperCase();

  const [myLocation, setMyLocation] = useState("");
  const [myTransports, setMyTransports] = useState<Transport[]>([]);
  const [myDistance, setMyDistance] = useState<DistanceTolerance | null>(null);
  const [myAtmosphere, setMyAtmosphere] = useState<AtmospherePreference | null>(null);
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [sherlockOpen, setSherlockOpen] = useState(false);
  const [sherlockLoading, setSherlockLoading] = useState(false);
  const [sherlockPlaces, setSherlockPlaces] = useState<RecommendedPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [view, setView] = useState<RoomView>("waiting");
  const [confirmedPlace, setConfirmedPlace] = useState<RecommendedPlace | null>(null);
  const [copied, setCopied] = useState(false);

  const readyCount = locationSaved ? 3 : 2;
  const totalCount = MOCK_PARTICIPANTS.length;
  const allReady = readyCount === totalCount;
  const isCurrentUserHost = MOCK_PARTICIPANTS.find((p) => p.isMe)?.isHost ?? false;

  function handleSaveLocation() {
    if (!myLocation.trim()) {
      setLocationError("지역명을 입력해주세요");
      return;
    }
    if (myTransports.length === 0) {
      setLocationError("이동 가능한 교통수단을 하나 이상 선택해주세요");
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
    setLocationSaved(true);
  }

  async function handleRunSherlock() {
    setSherlockOpen(true);
    setSherlockLoading(true);
    setSherlockPlaces([]);
    setSelectedPlaceId(null);
    await new Promise((r) => setTimeout(r, 3500));
    setSherlockPlaces(MOCK_PLACES);
    setSherlockLoading(false);
  }

  function handleSelectPlace(place: RecommendedPlace) {
    setSelectedPlaceId(place.placeId);
  }

  function handleConfirmPlace() {
    const place = sherlockPlaces.find((p) => p.placeId === selectedPlaceId);
    if (!place) return;
    setConfirmedPlace(place);
    setSherlockOpen(false);
    setView("done");
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (view === "done" && confirmedPlace) {
    return (
      <div className="min-h-dvh bg-[#F4F2EE] flex flex-col">
        <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-3">
          <span className="text-[20px] font-black text-[#1C1A17] tracking-tight">
            Meet<span className="text-[#7C5CFC]">Spot</span>
          </span>
          <Badge variant="success" dot>확정됨</Badge>
        </header>
        <ScheduleView
          placeName={confirmedPlace.placeName}
          placeAddress={confirmedPlace.placeAddress}
          roomCode={roomCode}
          onReset={() => router.push("/room/create")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F4F2EE] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-3">
        <div>
          <Link href="/" className="text-[20px] font-black text-[#1C1A17] tracking-tight">
            Meet<span className="text-[#7C5CFC]">Spot</span>
          </Link>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E1D9] rounded-full text-[13px] font-semibold text-[#4A4740] hover:border-[#D0CCC4] hover:bg-[#F0EDE7] transition-colors"
        >
          <span className="font-mono tracking-wider text-[#1C1A17]">{roomCode}</span>
          <span className="text-[#908D87]">{copied ? "✓" : "📋"}</span>
        </button>
      </header>

      <main className="flex-1 px-5 pb-32 overflow-y-auto">
        {/* Status row */}
        <div className="flex items-center gap-2 mb-6">
          <Badge variant={allReady ? "success" : "warning"} dot>
            {allReady ? "모두 준비됨" : "대기 중"}
          </Badge>
          <span className="text-[13px] text-[#908D87]">
            {readyCount}/{totalCount}명 정보 입력 완료
          </span>
        </div>

        {/* Section: Participants */}
        <div className="mb-6">
          <p className="text-[12px] font-semibold text-[#908D87] tracking-widest uppercase mb-3">
            참가자
          </p>
          <div className="space-y-2">
            {MOCK_PARTICIPANTS.map((p, idx) => (
              <ParticipantCard
                key={p.id}
                nickname={p.nickname}
                isHost={p.isHost}
                abstractLocation={
                  p.isMe
                    ? (locationSaved ? myLocation : undefined)
                    : (p.abstractLocation ?? undefined)
                }
                transports={
                  p.isMe ? (locationSaved ? myTransports : []) : p.transports
                }
                isReady={p.isMe ? locationSaved : p.abstractLocation !== null}
                isMe={p.isMe}
                animationDelay={`${idx * 0.06}s`}
              />
            ))}
          </div>
        </div>

        {/* Section: My preference input */}
        {!locationSaved && (
          <div className="bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_4px_12px_rgba(28,26,23,0.08)] p-5 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[18px]">📍</span>
              <h3 className="text-[15px] font-bold text-[#1C1A17]">
                내 정보 알려주기
              </h3>
            </div>

            {/* Location input */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-[#908D87] tracking-widest uppercase mb-2">
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
                  "placeholder:text-[#D0CCC4]",
                  "outline-none transition-all duration-150",
                  "focus:ring-2 focus:ring-[#7C5CFC] focus:ring-offset-0 focus:border-[#7C5CFC]",
                  locationError
                    ? "border-[#DC2626] bg-[#FEF2F2]"
                    : "border-[#E5E1D9] bg-[#F4F2EE] focus:bg-white",
                ].join(" ")}
              />
            </div>

            {/* Transport — multi-select */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-[#908D87] tracking-widest uppercase">
                  이동 가능한 교통수단
                </label>
                <span className="text-[10px] text-[#C4C1BC]">여러 개 선택 가능</span>
              </div>
              <TransportPicker value={myTransports} onChange={setMyTransports} />
            </div>

            {/* Distance tolerance */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-[#908D87] tracking-widest uppercase mb-2">
                이동 거리 선호
              </label>
              <div className="flex gap-2">
                {DISTANCE_OPTIONS.map((opt) => {
                  const isSelected = myDistance === opt.value;
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
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-1",
                        isSelected
                          ? "bg-[#F0ECFF] border-[#7C5CFC] shadow-[0_0_0_1px_#7C5CFC]"
                          : "bg-[#F4F2EE] border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6]",
                      ].join(" ")}
                    >
                      <span className="text-xl leading-none">{opt.emoji}</span>
                      <span
                        className={[
                          "text-[11px] font-semibold leading-tight mt-0.5",
                          isSelected ? "text-[#7C5CFC]" : "text-[#4A4740]",
                        ].join(" ")}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-[#908D87] leading-none">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atmosphere preference */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-[#908D87] tracking-widest uppercase mb-2">
                선호 분위기
              </label>
              <div className="flex gap-2">
                {ATMOSPHERE_OPTIONS.map((opt) => {
                  const isSelected = myAtmosphere === opt.value;
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
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-1",
                        isSelected
                          ? "bg-[#F0ECFF] border-[#7C5CFC] shadow-[0_0_0_1px_#7C5CFC]"
                          : "bg-[#F4F2EE] border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6]",
                      ].join(" ")}
                    >
                      <span className="text-xl leading-none">{opt.emoji}</span>
                      <span
                        className={[
                          "text-[11px] font-semibold leading-tight mt-0.5",
                          isSelected ? "text-[#7C5CFC]" : "text-[#4A4740]",
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
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#DC2626] text-[13px]">⚠️</span>
                <p className="text-[12px] text-[#DC2626]">{locationError}</p>
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

        {/* Location saved confirmation */}
        {locationSaved && (
          <div className="flex items-center gap-3 p-4 bg-[#E8F5EC] rounded-xl border border-[#27A644]/20 mb-6">
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
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E5E1D9] mb-4">
            <span className="text-[20px]">⏳</span>
            <div>
              <p className="text-[13px] font-semibold text-[#4A4740]">
                참가자 대기 중
              </p>
              <p className="text-[12px] text-[#908D87]">
                이영희님이 정보를 입력하면 Sherlock을 실행할 수 있어요
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-safe pb-5 bg-gradient-to-t from-[#F4F2EE] from-80% to-transparent pt-4">
        {isCurrentUserHost ? (
          <>
            <div
              className="rounded-[10px] overflow-hidden"
              style={allReady ? { animation: "cta-glow 2.4s ease-in-out infinite" } : undefined}
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!allReady}
                onClick={handleRunSherlock}
              >
                <span className="text-[18px]">🔍</span>
                {allReady ? "Sherlock 실행하기" : `참가자 대기 중 (${readyCount}/${totalCount})`}
              </Button>
            </div>

            {selectedPlaceId && sherlockPlaces.length > 0 && !sherlockOpen && (
              <div className="mt-2" style={{ animation: "fade-up 0.3s ease-out both" }}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setSherlockOpen(true)}
                >
                  선택한 장소 다시 보기
                </Button>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex items-center gap-3 py-3.5 px-4 bg-white rounded-xl border border-[#E5E1D9]"
            style={{ animation: "fade-up 0.3s ease-out both" }}
          >
            <div className="flex gap-[3px] shrink-0">
              {([0, 0.15, 0.3] as const).map((d) => (
                <div
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"
                  style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
                />
              ))}
            </div>
            <p className="text-[13px] font-medium text-[#4A4740]">
              호스트가 장소 추천을 준비하고 있어요
            </p>
          </div>
        )}
      </div>

      {/* Sherlock panel */}
      <SherlockPanel
        open={sherlockOpen}
        onClose={() => setSherlockOpen(false)}
        places={sherlockPlaces}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={handleSelectPlace}
        onRegenerate={handleRunSherlock}
        isLoading={sherlockLoading}
        participantCount={MOCK_PARTICIPANTS.length}
      />

      {/* Confirm CTA — inside panel's z-layer, shown when place selected */}
      {selectedPlaceId && sherlockOpen && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-safe pb-5 z-[60]"
          style={{
            background:
              "linear-gradient(to top, rgba(240,236,255,0.97) 70%, transparent)",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirmPlace}
          >
            ✓ 이 장소로 정하기
          </Button>
        </div>
      )}
    </div>
  );
}
