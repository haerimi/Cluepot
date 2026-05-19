"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Transport } from "@/types/participant";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { ParticipantCard } from "@/app/components/ParticipantCard";
import { TransportPicker } from "@/app/components/TransportPicker";
import { SherlockPanel } from "@/app/components/SherlockPanel";

/* ── Mock data ── */
interface MockParticipant {
  id: string;
  nickname: string;
  isHost: boolean;
  abstractLocation: string | null;
  transport: Transport | null;
  isMe?: boolean;
}

const MOCK_PARTICIPANTS: MockParticipant[] = [
  {
    id: "1",
    nickname: "박해림",
    isHost: true,
    abstractLocation: "강남구",
    transport: "transit",
    isMe: true,
  },
  {
    id: "2",
    nickname: "김철수",
    isHost: false,
    abstractLocation: "마포구",
    transport: "walk",
  },
  {
    id: "3",
    nickname: "이영희",
    isHost: false,
    abstractLocation: null,
    transport: null,
  },
];

const MOCK_PLACES = [
  {
    placeId: "p1",
    placeName: "홍콩반점0410 강남점",
    placeAddress: "서울 강남구 테헤란로 142",
    category: "restaurant" as Category,
    rating: 4.8,
    avgMinutes: 17,
    distance: "중간 지점",
    lat: 37.5012,
    lng: 127.039,
  },
  {
    placeId: "p2",
    placeName: "블루보틀 커피 삼청점",
    placeAddress: "서울 종로구 삼청로 100",
    category: "cafe" as Category,
    rating: 4.6,
    avgMinutes: 22,
    distance: "중간 지점",
    lat: 37.5825,
    lng: 126.9822,
  },
  {
    placeId: "p3",
    placeName: "이자카야 하나 서초점",
    placeAddress: "서울 서초구 서초대로 77",
    category: "bar" as Category,
    rating: 4.5,
    avgMinutes: 19,
    distance: "중간 지점",
    lat: 37.4967,
    lng: 127.0276,
  },
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
                  p.isMe ? "bg-[#FF5C00] text-white" : "bg-[#F0EDE7] text-[#4A4740]",
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
  const roomCode = (params?.code as string ?? "").toUpperCase();

  const [myLocation, setMyLocation] = useState("");
  const [myTransport, setMyTransport] = useState<Transport | null>(null);
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [sherlockOpen, setSherlockOpen] = useState(false);
  const [sherlockLoading, setSherlockLoading] = useState(false);
  const [sherlockPlaces, setSherlockPlaces] = useState<typeof MOCK_PLACES>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [view, setView] = useState<RoomView>("waiting");
  const [confirmedPlace, setConfirmedPlace] = useState<(typeof MOCK_PLACES)[0] | null>(null);

  const [copied, setCopied] = useState(false);

  const readyCount = locationSaved ? 3 : 2; // Me + 1 already ready in mock
  const totalCount = MOCK_PARTICIPANTS.length;
  const allReady = readyCount === totalCount;

  function handleSaveLocation() {
    if (!myLocation.trim()) {
      setLocationError("지역명을 입력해주세요");
      return;
    }
    if (!myTransport) {
      setLocationError("교통수단을 선택해주세요");
      return;
    }
    setLocationError(null);
    setLocationSaved(true);
  }

  async function handleRunSherlock() {
    setSherlockOpen(true);
    setSherlockLoading(true);
    setSherlockPlaces([]);
    await new Promise((r) => setTimeout(r, 3500));
    setSherlockPlaces(MOCK_PLACES);
    setSherlockLoading(false);
  }

  function handleSelectPlace(place: (typeof MOCK_PLACES)[0]) {
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
            Meet<span className="text-[#FF5C00]">Spot</span>
          </span>
          <Badge variant="success" dot>확정됨</Badge>
        </header>
        <ScheduleView
          placeName={confirmedPlace.placeName}
          placeAddress={confirmedPlace.placeAddress}
          roomCode={roomCode}
          onReset={() => {
            setView("waiting");
            setConfirmedPlace(null);
            setSelectedPlaceId(null);
            setSherlockPlaces([]);
          }}
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
            Meet<span className="text-[#FF5C00]">Spot</span>
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
            {readyCount}/{totalCount}명 위치 입력 완료
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
                transport={
                  p.isMe ? (locationSaved ? myTransport : null) : p.transport
                }
                isReady={p.isMe ? locationSaved : p.abstractLocation !== null}
                isMe={p.isMe}
                animationDelay={`${idx * 0.06}s`}
              />
            ))}
          </div>
        </div>

        {/* Section: My location input */}
        {!locationSaved && (
          <div className="bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_4px_12px_rgba(28,26,23,0.08)] p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[18px]">📍</span>
              <h3 className="text-[15px] font-bold text-[#1C1A17]">
                내 위치 알려주기
              </h3>
            </div>

            <div className="mb-4">
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
                  "focus:ring-2 focus:ring-[#FF5C00] focus:ring-offset-0 focus:border-[#FF5C00]",
                  locationError
                    ? "border-[#DC2626] bg-[#FEF2F2]"
                    : "border-[#E5E1D9] bg-[#F4F2EE] focus:bg-white",
                ].join(" ")}
              />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#908D87] tracking-widest uppercase mb-2">
                이동 수단
              </label>
              <TransportPicker
                value={myTransport}
                onChange={setMyTransport}
              />
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
              위치 저장하기
            </Button>
          </div>
        )}

        {/* Location saved confirmation */}
        {locationSaved && (
          <div className="flex items-center gap-3 p-4 bg-[#E8F5EC] rounded-xl border border-[#27A644]/20 mb-6">
            <span className="text-[20px]">✅</span>
            <div>
              <p className="text-[14px] font-semibold text-[#1A7A35]">
                위치가 저장됐어요!
              </p>
              <p className="text-[12px] text-[#27A644]">
                모든 참가자가 준비되면 Sherlock을 실행해요
              </p>
            </div>
          </div>
        )}

        {/* Sherlock status hint */}
        {!allReady && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E5E1D9] mb-4">
            <span className="text-[20px]">⏳</span>
            <div>
              <p className="text-[13px] font-semibold text-[#4A4740]">
                참가자 대기 중
              </p>
              <p className="text-[12px] text-[#908D87]">
                이영희님이 위치를 입력하면 Sherlock을 실행할 수 있어요
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-safe pb-5 bg-gradient-to-t from-[#F4F2EE] from-80% to-transparent pt-4">
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

        {selectedPlaceId && sherlockPlaces.length > 0 && (
          <div className="mt-2" style={{ animation: "fade-up 0.3s ease-out both" }}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setSherlockOpen(true)}
            >
              선택한 장소 확정하기
            </Button>
          </div>
        )}
      </div>

      {/* Sherlock panel */}
      <SherlockPanel
        open={sherlockOpen}
        onClose={() => setSherlockOpen(false)}
        places={sherlockPlaces}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={(place) => handleSelectPlace(place as (typeof MOCK_PLACES)[0])}
        onRegenerate={handleRunSherlock}
        isLoading={sherlockLoading}
      />

      {/* Confirm floating action (when place selected) */}
      {selectedPlaceId && sherlockOpen && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-safe pb-5 z-[60] bg-gradient-to-t from-[#F4F2EE] from-80% to-transparent pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirmPlace}
          >
            ✓ 이 장소로 확정하기
          </Button>
        </div>
      )}
    </div>
  );
}
