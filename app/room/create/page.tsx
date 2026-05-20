"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";
import { CategoryPicker } from "@/app/components/CategoryPicker";

type Step = 1 | 2 | 3;

const SHERLOCK_FEATURES = [
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
    desc: "왜 이 장소인지 Sherlock이 직접 설명해줘요",
  },
] as const;

export default function CreateRoomPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!category) return;
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
          Meet<span className="text-[#7C5CFC]">Spot</span>
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
                s <= step ? "bg-[#7C5CFC]" : "bg-[#E5E1D9]",
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
              <p className="text-[12px] font-semibold text-[#7C5CFC] tracking-widest uppercase mb-2">
                Step 1
              </p>
              <h1 className="text-[28px] font-black text-[#1C1A17] leading-tight tracking-[-0.8px] mb-2">
                어떤 만남인가요?
              </h1>
              <p className="text-[14px] text-[#908D87]">
                장소 카테고리를 선택해주세요
              </p>
            </div>

            <CategoryPicker value={category} onChange={setCategory} />

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

        {/* ── Step 2: Sherlock intro ── */}
        {step === 2 && (
          <div className="flex flex-col flex-1" style={{ animation: "fade-up 0.35s ease-out both" }}>
            <div className="mb-8">
              <p className="text-[12px] font-semibold text-[#7C5CFC] tracking-widest uppercase mb-2">
                Step 2 · Sherlock Mode
              </p>
              <h1 className="text-[28px] font-black text-[#1C1A17] leading-tight tracking-[-0.8px] mb-2">
                Sherlock이<br />공정하게 조율해요
              </h1>
              <p className="text-[14px] text-[#908D87] leading-relaxed">
                참가자가 각자 선호를 입력하면,
                <br />
                Sherlock이 모두를 위한 장소를 찾아줘요
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-3 mb-8">
              {SHERLOCK_FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E5E1D9]"
                  style={{ animation: `fade-up 0.35s ease-out ${0.05 + i * 0.07}s both` }}
                >
                  <span className="text-[22px] leading-none mt-0.5 shrink-0">{f.emoji}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1C1A17] mb-0.5">{f.title}</p>
                    <p className="text-[12px] text-[#908D87] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div
              className="flex items-center gap-2 px-4 py-3 bg-[#F0ECFF] rounded-xl border border-[#7C5CFC]/20 mb-8"
              style={{ animation: "fade-up 0.35s ease-out 0.26s both" }}
            >
              <span className="text-[14px]">🤝</span>
              <p className="text-[12px] text-[#7C5CFC] font-medium leading-relaxed">
                다수결이 아닙니다. 모두의 상황을 고려해요.
              </p>
            </div>

            <div className="mt-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
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
            <div className="w-20 h-20 rounded-full bg-[#F0ECFF] flex items-center justify-center text-[40px] mb-6">
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

            {/* Category + mode badge */}
            <div className="flex items-center gap-2 mb-10">
              <span className="text-[13px] text-[#908D87]">
                {category === "restaurant" && "🍽 맛집"}
                {category === "cafe" && "☕ 카페"}
                {category === "bar" && "🍺 술집"}
                {category === "brunch" && "🥂 브런치"}
                {category === "dessert" && "🍰 디저트"}
              </span>
              <span className="text-[#D0CCC4]">·</span>
              <span className="text-[13px] text-[#7C5CFC] font-medium">🔍 Sherlock 협력 조율</span>
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
