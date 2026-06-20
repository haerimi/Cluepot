"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@/types/room";
import { CategoryPicker, CATEGORIES } from "@/app/components/CategoryPicker";
import { useRoomStore } from "@/store/room";
import { createRoom } from "@/app/actions/rooms";
import { joinRoom } from "@/app/actions/participant";
import { createClient } from "@/util/supabase/client";

type Step = 1 | 2 | 3;

function IconBalance() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M5 4h14M3 12l4-5 4 5M13 12l4-5 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17h8M13 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconMasks() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10.5c.5-.5 1-.5 2 0M11.5 10.5c.5-.5 1-.5 2 0M7.5 13.5c1 1 2 1 3 0M12.5 13.5c1 1 2 1 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8.5 11.5h5M11 9v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

const PINI_FEATURES = [
  {
    Icon: IconBalance,
    title: "이동 부담을 균등하게",
    desc: "한 명에게만 불리한 장소는 추천하지 않아요",
  },
  {
    Icon: IconMasks,
    title: "분위기 선호도 조율",
    desc: "각자의 취향을 반영해 모두가 좋아할 곳을 찾아요",
  },
  {
    Icon: IconSearch,
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

const STEP_LABELS: Record<1 | 2, string> = {
  1: "모임 설정",
  2: "PINI 소개",
};

// ── 아이콘 ──────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 3.8L5.5 7.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 12.2L5.5 8.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

// ── StepIndicator ────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <nav
      aria-label="모임 생성 단계"
      className="flex items-center px-4 sm:px-6 lg:px-20 h-12 shrink-0 border-b border-hairline"
    >
      {([1, 2] as const).map((s, i) => (
        <div key={s} className="flex items-center">
          {i > 0 && (
            <div
              className="w-6 sm:w-12 lg:w-20 h-px mx-1 sm:mx-3 transition-colors duration-500"
              style={{ backgroundColor: s <= currentStep ? "#5e6ad2" : "#23252a" }}
            />
          )}
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 shrink-0"
              aria-current={s === currentStep ? "step" : undefined}
              style={{
                backgroundColor:
                  s < currentStep ? "#5e6ad2"
                  : s === currentStep ? "#5e6ad2"
                  : "#23252a",
                color:
                  s < currentStep ? "#fff"
                  : s === currentStep ? "#fff"
                  : "#4a4d5a",
              }}
            >
              {s < currentStep ? "✓" : s}
            </div>
            <span
              className="text-[12px] font-medium transition-colors duration-200 hidden sm:block"
              style={{ color: s === currentStep ? "#f7f8f8" : "#4a4d5a" }}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        </div>
      ))}
    </nav>
  );
}

// ── CtaButton ────────────────────────────────────────────────

interface CtaButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
  success?: boolean;
  "aria-label"?: string;
  children: React.ReactNode;
}

function CtaButton({ onClick, disabled, loading, pulse, success, "aria-label": ariaLabel, children }: CtaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={[
        "w-full h-[52px] rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]",
      ].join(" ")}
      style={{
        backgroundColor: success ? "rgba(39,166,68,0.1)" : "#5e6ad2",
        border: success ? "1px solid rgba(39,166,68,0.3)" : "none",
        color: success ? "#1A7A35" : "#fff",
        boxShadow: success ? "none" : (pulse && !disabled && !loading ? undefined : "0 1px 3px rgba(94,106,210,0.3)"),
        animation: !success && pulse && !disabled && !loading ? "cta-glow 2.8s ease-in-out infinite" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && !success) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f58b0";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && !success) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5e6ad2";
        }
      }}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-11 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98] bg-surface border border-hairline text-ink hover:border-hairline-strong hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

// ── 코드 개별 문자 박스 ──────────────────────────────────────

function CodeLetterBox({ char, index }: { char: string; index: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl font-mono font-black text-[28px] sm:text-[34px] shrink-0 transition-all duration-150 hover:scale-105 hover:border-accent"
      style={{
        width: "clamp(44px, 13vw, 64px)",
        height: "clamp(56px, 16vw, 80px)",
        backgroundColor: "#141516",
        border: "1px solid #23252a",
        color: "#5e6ad2",
        animation: `fade-up 0.4s ease-out ${0.25 + index * 0.06}s both`,
      }}
    >
      {char}
    </div>
  );
}

// ── CreateRoomPage ────────────────────────────────────────────

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
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roomCode = useRoomStore((s) => s.roomInfo?.roomCode);
  const setRoom = useRoomStore((s) => s.setRoom);

  async function handleCreate() {
    if (!category) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const { roomCode, roomId } = await createRoom(category, name);
      await joinRoom(roomCode);
      setRoom({
        roomId,
        roomCode,
        roomCategory: category,
        roomStatus: "waiting",
        linkExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setStep(3);
    } catch {
      setCreateError("모임 생성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleCopy() {
    if (!roomCode) return;

    navigator.clipboard.writeText(roomCode);

    setCopied(true);

    setTimeout(() => setCopied(false), 2500);
  }

  const canProceedStep1 = !!category && name.trim().length > 0;

  return (
    <div className="min-h-dvh overflow-x-hidden overflow-y-auto flex flex-col bg-canvas">

      {/* ── 상단 네비게이션 — 로그인/회원가입 구조 동일 ── */}
      <header
        className="fixed top-0 w-full z-50"
        style={{
          background: "rgba(1,1,2,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid #23252a",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* 좌측: 뒤로가기(조건부) + 브랜드 로고 */}
          <div className="flex items-center gap-3">
            {step < 3 && (
              <button
                onClick={() => step === 1 ? router.back() : setStep((s) => (s - 1) as Step)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-hairline text-ink-subtle hover:border-hairline-strong hover:text-ink-muted transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="뒤로 가기"
              >
                <IconBack />
              </button>
            )}

            <Link
              href="/"
              aria-label="CluePot 홈으로"
              className="flex items-center gap-2 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
            >
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                </svg>
              </div>
              <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-ink">
                CluePot
              </span>
            </Link>
          </div>

          {/* 우측: 코드로 참가 */}
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="모임 참가 네비게이션">
            <span className="hidden sm:block text-[13px] font-medium text-ink-subtle">
              이미 모임이 있으신가요?
            </span>
            <Link
              href="/rooms/join"
              className="h-9 px-4 text-[13px] font-medium rounded-lg border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong hover:bg-surface-2 flex items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              코드로 참가
            </Link>
          </nav>

        </div>

      </header>

      {/* ── Step Indicator ── */}
      {step < 3 && (
        <div className="pt-14 shrink-0">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* ── Main ── */}
      <main className={["flex-1 flex flex-col min-w-0", step < 3 ? "" : "pt-14"].join(" ")}>
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-8 lg:py-14 flex flex-col flex-1 min-w-0">

          {/* ── Step 1: 모임 이름 + 카테고리 ── */}
          {step === 1 && (
            <div
              className="flex flex-col flex-1 min-w-0"
              style={{ animation: "cinematic-up 0.5s ease-out both" }}
            >
              <div className="mb-8">
                <p className="text-[11px] font-bold text-accent tracking-[3px] uppercase mb-4">
                  Step 01
                </p>

                <h1
                  id="step1-heading"
                  className="text-[28px] sm:text-[34px] lg:text-[44px] font-black text-ink leading-[1.05] tracking-[-1.5px] mb-3 break-keep"
                >
                  모임을 설정해주세요
                </h1>

                <p className="text-[14px] lg:text-[15px] text-ink-subtle leading-relaxed break-keep">
                  이름과 카테고리를 선택하면 바로 시작할 수 있어요
                </p>
              </div>

              {/* 모임 이름 입력 */}
              <section
                className="mb-7"
                style={{ animation: "fade-up 0.4s ease-out 0.08s both" }}
                aria-labelledby="label-room-name"
              >
                <label
                  id="label-room-name"
                  htmlFor="room-name"
                  className="block text-[11px] font-bold text-ink-muted tracking-[2px] uppercase mb-3"
                >
                  모임 이름
                  <span aria-hidden="true" className="ml-1 text-accent">*</span>
                </label>

                <div
                  className="flex items-center rounded-xl border border-hairline bg-surface transition-all duration-200 min-w-0 focus-within:bg-surface-2 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(94,106,210,0.15)]"
                >
                  <input
                    id="room-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`예: ${CATEGORY_PLACEHOLDER[category ?? ""] ?? "모임 이름 입력"}`}
                    maxLength={30}
                    autoFocus
                    autoCapitalize="sentences"
                    autoCorrect="off"
                    aria-required="true"
                    className="flex-1 h-14 px-4 bg-transparent text-[16px] font-medium text-ink outline-none min-w-0 placeholder:text-ink-subtle"
                  />
                  <span
                    className="pr-4 text-[12px] shrink-0 transition-colors duration-150"
                    style={{ color: name.length > 0 ? "#4a4d5a" : "#2d2f36" }}
                  >
                    {name.length}/30
                  </span>
                </div>
              </section>

              {/* 구분선 */}
              <div className="h-px bg-hairline mb-7" style={{ animation: "fade-up 0.3s ease-out 0.12s both" }} />

              {/* 카테고리 선택 */}
              <section
                style={{ animation: "fade-up 0.4s ease-out 0.15s both" }}
                aria-labelledby="label-category"
              >
                <p
                  id="label-category"
                  className="text-[11px] font-bold text-ink-muted tracking-[2px] uppercase mb-4"
                >
                  카테고리
                  <span aria-hidden="true" className="ml-1 text-accent">*</span>
                </p>

                <CategoryPicker value={category} onChange={setCategory} />
              </section>

              <div className="mt-auto pt-10">
                <div className="h-px bg-hairline mb-6" />

                <CtaButton disabled={!canProceedStep1} pulse={canProceedStep1} onClick={() => setStep(2)}>
                  <span>다음</span>
                  <IconArrow />
                </CtaButton>
              </div>
            </div>
          )}

          {/* ── Step 2: PINI 소개 ── */}
          {step === 2 && (
            <div
              className="flex flex-col flex-1 min-w-0"
              style={{ animation: "cinematic-up 0.5s ease-out both" }}
            >
              <div className="mb-10">
                <p className="text-[11px] font-bold text-accent tracking-[3px] uppercase mb-4">
                  Step 02 · PINI Mode
                </p>

                <h1 className="text-[30px] sm:text-[36px] lg:text-[48px] font-black text-ink leading-[1.0] tracking-[-1.5px] mb-4 break-keep">
                  피니가
                  <br />
                  공정하게 조율해요
                </h1>

                <p className="text-[14px] lg:text-[15px] text-ink-subtle leading-[1.75] break-keep">
                  참가자가 각자 선호를 입력하면,
                  <br />
                  피니가 모두를 위한 장소를 찾아줘요
                </p>
              </div>

              <div className="space-y-3 mb-8 min-w-0">
                {PINI_FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 bg-surface rounded-2xl border border-hairline hover:border-hairline-strong transition-colors min-w-0 overflow-hidden"
                    style={{
                      animation: `fade-up 0.4s ease-out ${0.06 + i * 0.09}s both`,
                    }}
                  >
                    <span className="text-accent leading-none mt-0.5 shrink-0"><f.Icon /></span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-ink mb-1 break-keep">
                        {f.title}
                      </p>
                      <p className="text-[13px] text-ink-subtle leading-[1.6] break-keep">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="flex items-center gap-3 px-4 sm:px-5 py-4 bg-accent-light rounded-xl border border-accent/20 mb-10 min-w-0"
                style={{ animation: "fade-up 0.4s ease-out 0.35s both" }}
              >
                <span className="text-accent shrink-0" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 9l3-3 2.5 2.5 3.5-5L14 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <p className="text-[13px] text-accent font-medium leading-[1.6] break-keep min-w-0">
                  다수결이 아닙니다. 모두의 상황을 고려해요.
                </p>
              </div>

              <div className="mt-auto">
                <div className="h-px bg-hairline mb-6" />

                <CtaButton pulse loading={isCreating} onClick={handleCreate}>
                  {isCreating ? "모임 만드는 중…" : "모임 만들기"}
                </CtaButton>

                {createError && (
                  <p
                    key={createError}
                    className="text-[12px] text-error mt-3 text-center"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    style={{ animation: "fade-up 0.3s ease-out both" }}
                  >
                    {createError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: 코드 공유 ── */}
          {step === 3 && roomCode && (
            <div
              className="flex flex-col items-center justify-center flex-1 min-w-0 w-full py-8"
              style={{ animation: "cinematic-up 0.6s ease-out both" }}
            >
              {/* 성공 카드 */}
              <div
                className="w-full max-w-[480px] flex flex-col items-center rounded-2xl p-6 sm:p-10 relative overflow-hidden bg-surface border border-hairline"
              >
                {/* 상단 accent 라인 */}
                <div
                  className="absolute top-0 left-8 right-8 h-px"
                  aria-hidden="true"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(94,106,210,0.6), transparent)" }}
                />

                {/* 성공 아이콘 */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shrink-0 bg-accent-light border border-accent/20"
                  style={{
                    animation: "score-appear 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M5 14L11 20L23 8" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* 제목 */}
                <h1
                  className="text-[24px] sm:text-[28px] font-black text-ink text-center mb-2 break-keep"
                  style={{ animation: "fade-up 0.45s ease-out 0.1s both" }}
                >
                  모임이 만들어졌어요!
                </h1>

                <p
                  className="text-[14px] text-ink-subtle text-center mb-8 leading-relaxed break-keep"
                  style={{ animation: "fade-up 0.45s ease-out 0.15s both" }}
                >
                  아래 코드를 참가자들에게 공유해주세요
                </p>

                {/* 코드 개별 문자 박스 */}
                <div className="w-full mb-8">
                  <p
                    className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase text-center mb-4"
                    style={{ animation: "fade-up 0.4s ease-out 0.2s both" }}
                  >
                    모임 코드
                  </p>

                  <div
                    className="flex items-center justify-center gap-2 sm:gap-3"
                    aria-label={`모임 코드: ${roomCode}`}
                    role="text"
                  >
                    {roomCode.split("").map((char, i) => (
                      <CodeLetterBox key={i} char={char} index={i} />
                    ))}
                  </div>
                </div>

                {/* 카테고리 배지 */}
                <div
                  className="flex items-center gap-2 mb-8"
                  style={{ animation: "fade-up 0.4s ease-out 0.55s both" }}
                >
                  {(() => {
                    const cat = CATEGORIES.find((c) => c.value === category);
                    return cat ? (
                      <span className="text-[13px] text-ink-muted">{cat.label}</span>
                    ) : null;
                  })()}

                  <div className="w-px h-3 bg-hairline-strong" />

                  <span className="text-[13px] font-semibold text-accent">
                    PINI 협력 조율
                  </span>
                </div>

                {/* 액션 버튼 */}
                <div
                  className="w-full space-y-3"
                  style={{ animation: "fade-up 0.4s ease-out 0.6s both" }}
                >
                  {/* 복사 버튼 */}
                  <CtaButton onClick={handleCopy} success={copied} aria-label="모임 코드 복사하기">
                    {copied ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        복사됐어요!
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        코드 복사하기
                      </>
                    )}
                  </CtaButton>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 공유 버튼 */}
                    <SecondaryButton
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
                      <IconShare />
                      공유하기
                    </SecondaryButton>

                    {/* 모임 입장 */}
                    <SecondaryButton onClick={() => router.push(`/rooms/${roomCode}`)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M5 8h6M9 6l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      모임 입장
                    </SecondaryButton>
                  </div>
                </div>

                {/* 유효기간 안내 */}
                <div
                  className="flex items-center gap-2 mt-6 text-ink-subtle"
                  style={{ animation: "fade-up 0.4s ease-out 0.7s both" }}
                >
                  <IconLock />
                  <span className="text-[12px]">코드는 24시간 동안 유효해요</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── 푸터 — 로그인/회원가입 구조 동일 ── */}
      <footer className="w-full py-7 px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1200px] mx-auto">
        <span className="text-[12px] text-ink-subtle">
          © 2026 CluePot. All rights reserved.
        </span>
        <div className="flex gap-5">
          <a href="#" className="text-[12px] text-ink-subtle hover:text-ink-muted hover:underline underline-offset-2 transition-colors duration-150">
            개인정보처리방침
          </a>
          <a href="#" className="text-[12px] text-ink-subtle hover:text-ink-muted hover:underline underline-offset-2 transition-colors duration-150">
            이용약관
          </a>
        </div>
      </footer>

    </div>
  );
}
