"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { CategoryPicker } from "@/app/components/CategoryPicker";
import { useRoomStore } from "@/store/room";
import { createRoom } from "@/app/actions/rooms";
import { joinRoom } from "@/app/actions/participant";
import { createClient } from "@/util/supabase/client";

type Step = 1 | 2 | 3 | 4;

const PINI_FEATURES = [
  {
    emoji: "⚖️",
    title: "이동 부담을 균등하게",
    desc: "한 명에게만 불리한 장소는 추천하지 않아요",
  },
  {
    emoji: "🎭",
    title: "분위기 선호도 조율",
    desc: "각자의 취향을 반영해 모두가 좋아할 곳을 찾아요",
  },
  {
    emoji: "🔍",
    title: "이유를 설명해드려요",
    desc: "왜 이 장소인지 피니가 직접 설명해줘요",
  },
] as const;

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  restaurant: "팀 점심 식사",
  cafe: "스터디 카페 모임",
  bar: "금요일 뒷풀이",
  brunch: "주말 브런치",
  dessert: "디저트 탐방",
};

const STEP_LABELS: Record<Step, string> = {
  1: "카테고리",
  2: "모임 이름",
  3: "PINI 소개",
  4: "완료",
};

export default function CreateRoomPage() {
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [router]);

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const roomCode = useRoomStore((s) => s.roomInfo?.roomCode);
  const setRoom = useRoomStore((s) => s.setRoom);

  async function handleCreate() {
    if (!category) return;

    setIsCreating(true);

    const { roomCode, roomId } = await createRoom(category, name);

    await joinRoom(roomCode);

    setRoom({
      roomId,
      roomCode,
      roomCategory: category,
      roomStatus: "waiting",
      linkExpiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    setIsCreating(false);
    setStep(4);
  }

  function handleCopy() {
    if (!roomCode) return;

    navigator.clipboard.writeText(roomCode);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh overflow-x-hidden overflow-y-auto bg-[#F4F2EE] flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center gap-4 px-4 sm:px-6 lg:px-16 h-14 border-b border-[#E5E1D9] shrink-0">
        {step < 4 && (
          <button
            onClick={() =>
              step === 1 ? router.back() : setStep((s) => (s - 1) as Step)
            }
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E1D9] text-[#4A4740] hover:bg-[#F0EDE7] transition-colors shrink-0"
            aria-label="뒤로 가기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <span className="text-[18px] font-black text-[#1C1A17] tracking-tight">
          Clue<span className="text-[#7C5CFC]">Pot</span>
        </span>
      </header>

      {/* ── Step Indicator ── */}
      {step < 4 && (
        <div className="flex items-center px-4 sm:px-6 lg:px-16 h-12 border-b border-[#E5E1D9] shrink-0">
          {([1, 2, 3] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              {i > 0 && (
                <div
                  className={[
                    "w-6 sm:w-12 lg:w-20 h-px mx-1 sm:mx-3 transition-colors duration-300",
                    s <= step ? "bg-[#7C5CFC]" : "bg-[#E5E1D9]",
                  ].join(" ")}
                />
              )}

              <div className="flex items-center gap-2">
                <div
                  className={[
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 shrink-0",
                    s < step
                      ? "bg-[#7C5CFC] text-white"
                      : s === step
                      ? "bg-[#1C1A17] text-white"
                      : "bg-[#E5E1D9] text-[#908D87]",
                  ].join(" ")}
                >
                  {s < step ? "✓" : s}
                </div>

                <span
                  className={[
                    "text-[12px] font-medium transition-colors duration-200 hidden sm:block",
                    s === step ? "text-[#1C1A17]" : "text-[#908D87]",
                  ].join(" ")}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-8 lg:py-16 flex flex-col flex-1 min-w-0">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div
              className="flex flex-col flex-1 min-w-0"
              style={{ animation: "cinematic-up 0.5s ease-out both" }}
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold text-[#7C5CFC] tracking-[3px] uppercase mb-4">
                  Step 01
                </p>

                <h1 className="text-[30px] sm:text-[36px] lg:text-[48px] font-black text-[#1C1A17] leading-[1.0] tracking-[-1.5px] mb-3 break-keep">
                  어떤 만남인가요?
                </h1>

                <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-relaxed break-keep">
                  장소 카테고리를 선택해주세요
                </p>
              </div>

              <CategoryPicker value={category} onChange={setCategory} />

              <div className="mt-auto pt-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-[#E5E1D9]" />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!category}
                  onClick={() => setStep(2)}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div
              className="flex flex-col flex-1 min-w-0"
              style={{ animation: "cinematic-up 0.5s ease-out both" }}
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold text-[#7C5CFC] tracking-[3px] uppercase mb-4">
                  Step 02
                </p>

                <h1 className="text-[30px] sm:text-[36px] lg:text-[48px] font-black text-[#1C1A17] leading-[1.0] tracking-[-1.5px] mb-3 break-keep">
                  모임 이름을
                  <br />
                  지어주세요
                </h1>

                <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-relaxed break-keep">
                  참가자들에게 보여질 모임 이름이에요
                </p>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="room-name"
                  className="block text-[11px] font-bold tracking-[2px] uppercase mb-3"
                >
                  모임 이름
                </label>

                <input
                  id="room-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`예: ${
                    CATEGORY_PLACEHOLDER[category ?? ""] ??
                    "모임 이름 입력"
                  }`}
                  maxLength={30}
                  autoFocus
                  className="w-full h-14 px-4 rounded-xl border text-[16px] font-medium outline-none transition-all duration-150 border-[#E5E1D9] bg-white focus:ring-2 focus:ring-[#7C5CFC] focus:border-[#7C5CFC] min-w-0"
                />

                <p className="text-[11px] text-[#908D87] mt-2 text-right">
                  {name.length} / 30
                </p>
              </div>

              <div className="mt-auto pt-10">
                <div className="h-px bg-[#E5E1D9] mb-6" />

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!name.trim()}
                  onClick={() => setStep(3)}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div
              className="flex flex-col flex-1 min-w-0"
              style={{ animation: "cinematic-up 0.5s ease-out both" }}
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold text-[#7C5CFC] tracking-[3px] uppercase mb-4">
                  Step 03 · PINI Mode
                </p>

                <h1 className="text-[30px] sm:text-[36px] lg:text-[48px] font-black text-[#1C1A17] leading-[1.0] tracking-[-1.5px] mb-4 break-keep">
                  피니가
                  <br />
                  공정하게 조율해요
                </h1>

                <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-[1.75] break-keep">
                  참가자가 각자 선호를 입력하면,
                  <br />
                  피니가 모두를 위한 장소를 찾아줘요
                </p>
              </div>

              <div className="space-y-3 mb-8 min-w-0">
                {PINI_FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E1D9] hover:border-[#D0CCC4] transition-colors min-w-0 overflow-hidden"
                    style={{
                      animation: `fade-up 0.4s ease-out ${
                        0.06 + i * 0.09
                      }s both`,
                    }}
                  >
                    <span className="text-[24px] leading-none mt-0.5 shrink-0">
                      {f.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-[#1C1A17] mb-1 break-keep">
                        {f.title}
                      </p>

                      <p className="text-[13px] text-[#908D87] leading-[1.6] break-keep">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 px-4 sm:px-5 py-4 bg-[#F0ECFF] rounded-xl border border-[#7C5CFC]/20 mb-10 min-w-0">
                <span className="text-[16px] shrink-0">🤝</span>

                <p className="text-[13px] text-[#7C5CFC] font-medium leading-[1.6] break-keep min-w-0">
                  다수결이 아닙니다. 모두의 상황을 고려해요.
                </p>
              </div>

              <div className="mt-auto">
                <div className="h-px bg-[#E5E1D9] mb-6" />

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isCreating}
                  onClick={handleCreate}
                >
                  {isCreating ? "모임 만드는 중…" : "모임 만들기"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && roomCode && (
            <div
              className="flex flex-col items-center flex-1 pt-4 lg:pt-8 min-w-0 w-full"
              style={{ animation: "cinematic-up 0.6s ease-out both" }}
            >
              <div className="w-20 h-20 rounded-full bg-[#F0ECFF] flex items-center justify-center text-[40px] mb-8 shrink-0">
                🎉
              </div>

              <h1 className="text-[28px] sm:text-[32px] lg:text-[40px] font-black text-[#1C1A17] tracking-tight text-center mb-3 break-keep">
                모임이 만들어졌어요!
              </h1>

              <p className="text-[14px] lg:text-[15px] text-[#908D87] text-center mb-12 leading-relaxed break-keep">
                아래 코드를 참가자들에게 공유해주세요
              </p>

              {/* Room Code */}
              <div className="w-full bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_4px_24px_rgba(28,26,23,0.08)] p-5 sm:p-8 mb-5 overflow-hidden min-w-0">
                <p className="text-[11px] font-bold text-[#C4C1BC] tracking-[3px] uppercase text-center mb-5">
                  모임 코드
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 min-w-0">
                  <span
                    className="
                      text-[32px]
                      sm:text-[40px]
                      lg:text-[56px]
                      font-black
                      text-[#1C1A17]
                      tracking-[2px]
                      sm:tracking-[6px]
                      font-mono
                      break-all
                      text-center
                      leading-none
                    "
                  >
                    {roomCode}
                  </span>

                  <button
                    onClick={handleCopy}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F0EDE7] hover:bg-[#E5E1D9] text-[#4A4740] transition-colors text-[18px] shrink-0"
                    aria-label="코드 복사"
                  >
                    {copied ? "✓" : "📋"}
                  </button>
                </div>

                {copied && (
                  <p className="text-[12px] text-[#27A644] text-center mt-3 font-medium">
                    클립보드에 복사됐어요!
                  </p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 text-center">
                <span className="text-[13px] text-[#908D87]">
                  {category === "restaurant" && "🍽 맛집"}
                  {category === "cafe" && "☕ 카페"}
                  {category === "bar" && "🍺 술집"}
                  {category === "brunch" && "🥂 브런치"}
                  {category === "dessert" && "🍰 디저트"}
                </span>

                <div className="w-px h-3 bg-[#D0CCC4]" />

                <span className="text-[13px] text-[#7C5CFC] font-semibold">
                  🔍 PINI 협력 조율
                </span>
              </div>

              <div className="h-px w-full bg-[#E5E1D9] mb-8" />

              <div className="flex flex-col gap-3 w-full mt-auto min-w-0">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push(`/rooms/${roomCode}`)}
                >
                  모임 입장하기
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "CluePot 모임에 참가해요",
                        text: `모임 코드: ${roomCode}`,
                      });
                    } else {
                      handleCopy();
                    }
                  }}
                >
                  링크 공유하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}