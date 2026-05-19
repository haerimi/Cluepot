"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { CategoryPicker } from "@/app/components/CategoryPicker";

type SherlockPreference =
  | "nearest"
  | "midpoint"
  | "vibe"
  | "distance_no_matter";

interface PreferenceOption {
  value: SherlockPreference;
  label: string;
  desc: string;
  emoji: string;
}

const PREFERENCES: PreferenceOption[] = [
  {
    value: "nearest",
    label: "가까운 곳 선호",
    desc: "참가자와 가장 가까운 장소를 추천해요",
    emoji: "📌",
  },
  {
    value: "midpoint",
    label: "중간 지점 선호",
    desc: "모든 참가자에게 공평한 위치를 찾아요",
    emoji: "⚖️",
  },
  {
    value: "vibe",
    label: "분위기 우선",
    desc: "거리보다 장소의 분위기를 더 중시해요",
    emoji: "✨",
  },
  {
    value: "distance_no_matter",
    label: "이동 거리 상관없음",
    desc: "최고의 장소라면 멀어도 괜찮아요",
    emoji: "🗺",
  },
];

type Step = 1 | 2 | 3;

export default function CreateRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [preference, setPreference] = useState<SherlockPreference | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!category || !preference) return;
    setIsCreating(true);
    // TODO: POST /api/room
    await new Promise((r) => setTimeout(r, 800));
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setStep(3);
    setIsCreating(false);
  }

  function handleCopy() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-dvh bg-[#F4F2EE] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3">
        {step < 3 && (
          <button
            onClick={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E1D9] text-[#4A4740] hover:bg-[#F0EDE7] transition-colors"
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
        <span className="text-[20px] font-black text-[#1C1A17] tracking-tight">
          Meet<span className="text-[#FF5C00]">Spot</span>
        </span>
      </header>

      {/* Step indicator */}
      {step < 3 && (
        <div className="flex items-center gap-2 px-5 pb-4">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className={[
                "h-1 rounded-full flex-1 transition-all duration-300",
                s <= step ? "bg-[#FF5C00]" : "bg-[#E5E1D9]",
              ].join(" ")}
            />
          ))}
        </div>
      )}

      <main className="flex-1 px-5 pb-8 flex flex-col">
        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-[12px] font-semibold text-[#FF5C00] tracking-widest uppercase mb-2">
                Step 1
              </p>
              <h1 className="text-[28px] font-black text-[#1C1A17] leading-tight tracking-[-0.8px] mb-2">
                어떤 만남인가요?
              </h1>
              <p className="text-[14px] text-[#908D87]">
                장소 카테고리를 선택해주세요
              </p>
            </div>

            <CategoryPicker
              value={category}
              onChange={(c) => setCategory(c)}
            />

            <div className="mt-auto pt-8">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!category}
                onClick={() => setStep(2)}
              >
                다음
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Sherlock Preferences ── */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <p className="text-[12px] font-semibold text-[#FF5C00] tracking-widest uppercase mb-2">
                Step 2 · Sherlock Mode
              </p>
              <h1 className="text-[28px] font-black text-[#1C1A17] leading-tight tracking-[-0.8px] mb-2">
                어떻게 추천받을까요?
              </h1>
              <p className="text-[14px] text-[#908D87]">
                AI 추천 방식을 설정해주세요
              </p>
            </div>

            <div className="space-y-3">
              {PREFERENCES.map((pref) => {
                const isSelected = preference === pref.value;
                return (
                  <button
                    key={pref.value}
                    type="button"
                    onClick={() => setPreference(pref.value)}
                    className={[
                      "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150",
                      isSelected
                        ? "bg-[#FFF0E8] border-[#FF5C00] shadow-[0_0_0_1px_#FF5C00]"
                        : "bg-white border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6]",
                    ].join(" ")}
                  >
                    <span className="text-2xl leading-none mt-0.5 flex-shrink-0">
                      {pref.emoji}
                    </span>
                    <div className="flex-1">
                      <p
                        className={[
                          "text-[15px] font-semibold leading-snug",
                          isSelected ? "text-[#FF5C00]" : "text-[#1C1A17]",
                        ].join(" ")}
                      >
                        {pref.label}
                      </p>
                      <p className="text-[12px] text-[#908D87] mt-0.5 leading-relaxed">
                        {pref.desc}
                      </p>
                    </div>
                    <div
                      className={[
                        "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                        isSelected
                          ? "border-[#FF5C00] bg-[#FF5C00]"
                          : "border-[#D0CCC4]",
                      ].join(" ")}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-8">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!preference}
                loading={isCreating}
                onClick={handleCreate}
              >
                {isCreating ? "모임 만드는 중…" : "모임 만들기 🎉"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Room Code Reveal ── */}
        {step === 3 && roomCode && (
          <div className="flex flex-col items-center flex-1 pt-8">
            {/* Celebration */}
            <div className="w-20 h-20 rounded-full bg-[#FFF0E8] flex items-center justify-center text-[40px] mb-6">
              🎉
            </div>

            <h1 className="text-[26px] font-black text-[#1C1A17] tracking-tight text-center mb-2">
              모임이 만들어졌어요!
            </h1>
            <p className="text-[14px] text-[#908D87] text-center mb-10">
              아래 코드를 참가자들에게 공유해주세요
            </p>

            {/* Room code card */}
            <div className="w-full bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_4px_12px_rgba(28,26,23,0.08)] p-6 mb-4">
              <p className="text-[11px] font-semibold text-[#C4C1BC] tracking-[2px] uppercase text-center mb-3">
                모임 코드
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[40px] font-black text-[#1C1A17] tracking-[4px] font-mono">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F0EDE7] hover:bg-[#E5E1D9] text-[#4A4740] transition-colors text-[18px]"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
              {copied && (
                <p className="text-[12px] text-[#27A644] text-center mt-2">
                  클립보드에 복사됐어요!
                </p>
              )}
            </div>

            {/* Category badge */}
            <div className="flex items-center gap-2 mb-10">
              <span className="text-[13px] text-[#908D87]">
                {category === "restaurant" && "🍽 맛집"}
                {category === "cafe" && "☕ 카페"}
                {category === "bar" && "🍺 술집"}
                {category === "brunch" && "🥂 브런치"}
                {category === "dessert" && "🍰 디저트"}
              </span>
              <span className="text-[#D0CCC4]">·</span>
              <span className="text-[13px] text-[#908D87]">
                {preference === "nearest" && "📌 가까운 곳 선호"}
                {preference === "midpoint" && "⚖️ 중간 지점 선호"}
                {preference === "vibe" && "✨ 분위기 우선"}
                {preference === "distance_no_matter" && "🗺 거리 상관없음"}
              </span>
            </div>

            <div className="flex flex-col gap-3 w-full mt-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push(`/room/${roomCode}`)}
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
                      title: "MeetSpot 모임에 참가해요",
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
      </main>
    </div>
  );
}
