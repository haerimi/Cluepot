"use client";

import { logout, updateUserInfo } from "@/app/actions/auth";
import { createClient } from "@/util/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type UserInfo = {
  id: string;
  initial: string;
  joinedAt: string;
  nickname: string;
  email: string;
  profileImage: string | null;
};

/* ── 카드 내부 섹션 레이블 — 헤어라인 bar + smallcaps 텍스트 ── */
function SectionLabel({
  children,
  extra,
}: {
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-3 h-px bg-hairline-strong" />
      <span className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase">
        {children}
      </span>
      {extra}
    </div>
  );
}

/* ── 아바타 콘텐츠 — 이미지 또는 초기글자 fallback ── */
function AvatarContent({
  src,
  initial,
  imgAlt = "",
  textClass,
}: {
  src: string | null;
  initial: string;
  imgAlt?: string;
  textClass: string;
}) {
  if (src) {
    return (
      <img src={src} alt={imgAlt} className="w-full h-full object-cover" />
    );
  }
  return (
    <div className="w-full h-full bg-accent flex items-center justify-center">
      <span className={`${textClass} font-black text-white leading-none select-none`}>
        {initial}
      </span>
    </div>
  );
}

/* ── ProfileClient ── */
export default function ProfileClient({ user }: Readonly<{ user: UserInfo }>) {
  const router = useRouter();

  const [nickname, setNickname] = useState(user.nickname);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // setTimeout ID 보관 — 언마운트 시 / 재저장 시 클리어
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = nickname !== user.nickname || file !== null;
  const charNearLimit = nickname.length >= 24;
  const charAtLimit   = nickname.length >= 29;

  // previewUrl 변경 및 언마운트 시 Object URL 해제 — revoke 책임을 useEffect가 단독으로 소유
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 언마운트 시 진행 중인 성공 타이머 클리어
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleReset() {
    setNickname(user.nickname);
    setFile(null);
    setPreviewUrl(null); // useEffect cleanup이 URL.revokeObjectURL 처리
    setSaveError(null);
  }

  async function handleSave() {
    setSaveError(null);
    setIsSaving(true);
    try {
      let imageUrl: string | undefined;

      if (file) {
        const supabase = createClient();
        const safeName = file.name.replace(/\s/g, "_").replace(/[^\w.-]/g, "");
        const path = `user/${Date.now()}_${safeName}`;
        const { error } = await supabase.storage.from("cluepot").upload(path, file);
        if (error) {
          console.error("이미지 업로드 실패:", error);
          throw new Error("이미지 업로드에 실패했어요. 다시 시도해주세요.");
        }
        const { data } = supabase.storage.from("cluepot").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      await updateUserInfo(nickname, imageUrl ?? null);

      // 저장 성공 — 폼 상태 초기화 (isDirty가 true로 남지 않도록)
      setFile(null);
      setPreviewUrl(null); // useEffect cleanup이 URL revoke 처리

      setSaveSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveSuccess(false), 1500);

      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  const displayImage = previewUrl ?? user.profileImage;

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-10 py-8 lg:py-12"
      style={{ animation: "section-fade 0.35s ease-out both" }}
    >
      {/* 최대 너비 컨테이너 — lg에서 2열 */}
      <div className="max-w-[900px] mx-auto">

        {/* ── 페이지 헤더 ── */}
        <div
          className="mb-8 lg:mb-10"
          style={{ animation: "fade-up 0.4s ease-out 0.05s both" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-px bg-hairline-strong" />
            <span className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase">
              프로필
            </span>
          </div>
          <h1 className="text-[28px] lg:text-[34px] font-black text-ink tracking-tight leading-none">
            내 계정
          </h1>
        </div>

        {/* ── 2열 그리드 (lg+) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* ── 좌열: 폼 카드 + 푸터 ── */}
          <div>
            <div
              className="bg-surface rounded-2xl border border-hairline overflow-hidden"
              style={{
                boxShadow: "var(--shadow-md)",
                animation: "fade-up 0.4s ease-out 0.1s both",
              }}
            >

              {/* 아바타 영역 */}
              <div className="relative flex flex-col items-center gap-4 px-8 pt-10 pb-8 bg-surface border-b border-hairline">

                <label
                  htmlFor="profile-image-upload"
                  className="cursor-pointer select-none group"
                  aria-label="프로필 사진 변경"
                >
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  <div className="relative">
                    <div
                      className="relative w-[104px] h-[104px] sm:w-[116px] sm:h-[116px] rounded-full overflow-hidden
                                 border-[3px] border-canvas shadow-md
                                 ring-2 ring-hairline group-hover:ring-accent
                                 transition-all duration-200 group-hover:scale-[1.04] group-focus-within:ring-accent"
                    >
                      <AvatarContent
                        src={displayImage}
                        initial={user.initial}
                        imgAlt="프로필 사진"
                        textClass="text-[38px] sm:text-[42px]"
                      />

                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1
                                      bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                        <svg
                          width="22" height="22" viewBox="0 0 24 24" fill="none"
                          aria-hidden="true"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white drop-shadow-sm"
                        >
                          <path
                            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                          />
                          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                         text-white text-[11px] font-semibold leading-none">
                          변경
                        </span>
                      </div>
                    </div>

                    {/* 사진 변경 예정 뱃지 */}
                    {previewUrl && (
                      <span
                        className="absolute -bottom-1 -right-1 flex items-center gap-0.5
                                   text-[10px] font-bold text-accent bg-accent-light border border-accent/20
                                   px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap"
                        style={{ animation: "fade-up 0.2s ease-out both" }}
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                          <circle cx="4.5" cy="4.5" r="4" fill="#5e6ad2" />
                        </svg>
                        변경됨
                      </span>
                    )}
                  </div>
                </label>

                {/* 이름 + 이메일 요약 — 라이브 state 사용 */}
                <div className="text-center">
                  <p className="text-[17px] font-bold text-ink leading-snug">
                    {nickname || "이름 없음"}
                  </p>
                  <p className="text-[13px] text-ink-subtle mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* ── 폼 필드 ── */}
              <fieldset
                disabled={isSaving}
                aria-busy={isSaving}
                className="px-6 sm:px-8 pt-7 pb-2 flex flex-col gap-5 transition-opacity disabled:opacity-60"
              >
                <legend className="sr-only">프로필 정보 수정</legend>

                {/* 닉네임 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="profile-nickname"
                      className="text-[11px] font-bold text-ink-subtle uppercase tracking-widest"
                    >
                      닉네임
                    </label>
                    <span
                      className={[
                        "text-[11px] tabular-nums font-medium transition-colors duration-150",
                        charAtLimit
                          ? "text-error font-bold"
                          : charNearLimit
                          ? "text-warning"
                          : "text-ink-subtle",
                      ].join(" ")}
                      aria-live="polite"
                      aria-label={`닉네임 ${nickname.length}자 / 30자`}
                    >
                      {nickname.length}/30
                    </span>
                  </div>
                  <input
                    id="profile-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value); setSaveError(null); }}
                    maxLength={30}
                    placeholder="닉네임을 입력하세요"
                    aria-required="true"
                    autoComplete="nickname"
                    className="h-12 rounded-xl border border-hairline px-4 text-[14px] font-medium text-ink
                               placeholder:text-ink-subtle/50 bg-surface
                               hover:border-hairline-strong
                               focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                               transition-all duration-150"
                  />
                </div>

                {/* 이메일 */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="profile-email"
                    className="text-[11px] font-bold text-ink-subtle uppercase tracking-widest"
                  >
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      id="profile-email"
                      type="email"
                      value={user.email}
                      disabled
                      aria-readonly="true"
                      aria-describedby="email-readonly-hint"
                      className="h-12 w-full rounded-xl border border-hairline px-4 pr-11 text-[14px]
                                 text-ink-subtle bg-canvas cursor-not-allowed select-none"
                    />
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      aria-hidden="true"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle/50"
                    >
                      <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p id="email-readonly-hint" className="text-[11px] text-ink-subtle/70 pl-0.5">
                    이메일은 변경할 수 없어요
                  </p>
                </div>
              </fieldset>

              {/* ── 액션 바 ── */}
              <div className="px-6 sm:px-8 pt-5 pb-6 flex flex-col gap-3">

                {/* 에러 메시지 */}
                {saveError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2.5 px-4 py-3 bg-error-bg border border-error-border rounded-xl"
                    style={{ animation: "fade-up 0.2s ease-out both" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 mt-0.5 text-error">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="7" cy="10" r="0.8" fill="currentColor" />
                    </svg>
                    <p className="text-[12px] text-error leading-snug">{saveError}</p>
                  </div>
                )}

                {/* 버튼 열 */}
                <div className="flex flex-col items-stretch gap-2">

                  {/* 저장 */}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    aria-label={isSaving ? "저장 중입니다" : "변경사항 저장"}
                    className={[
                      "w-full h-12 rounded-xl",
                      "text-[14px] font-bold",
                      "flex items-center justify-center gap-2",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isDirty
                        ? [
                            "bg-accent-active text-white",
                            "hover:bg-accent-hover active:scale-[0.98]",
                            saveSuccess ? "focus-visible:ring-success" : "focus-visible:ring-accent",
                          ].join(" ")
                        : "bg-canvas text-ink-subtle cursor-not-allowed",
                    ].join(" ")}
                    style={
                      isDirty && !saveSuccess
                        ? { boxShadow: "0 1px 3px rgba(74,108,168,0.25), 0 0 0 1px rgba(74,108,168,0.15)" }
                        : undefined
                    }
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>저장 중...</span>
                      </>
                    ) : saveSuccess ? (
                      <span
                        className="flex items-center gap-1.5"
                        style={{ animation: "fade-up 0.2s ease-out both" }}
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                          <path d="M2.5 7.5L6 11L12.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        저장됨
                      </span>
                    ) : (
                      "변경사항 저장"
                    )}
                  </button>

                  {/* 취소 — isDirty일 때만 렌더링 */}
                  {isDirty && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSaving}
                      aria-label="변경사항 취소"
                      className="w-full h-10 rounded-xl
                                 text-[13px] font-medium text-ink-subtle
                                 hover:text-ink hover:bg-canvas
                                 active:scale-[0.98]
                                 transition-all duration-200
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-subtle/30 focus-visible:ring-offset-1"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>

              {/* ── 로그아웃 ── */}
              <div className="px-6 sm:px-8 py-4 border-t border-hairline bg-surface flex items-center justify-between gap-4">
                <p className="text-[11px] text-ink-subtle">가입 {user.joinedAt}</p>
                <button
                  type="button"
                  onClick={logout}
                  className="h-9 px-4 text-[12px] font-semibold text-error border border-error-border
                             rounded-full bg-surface
                             hover:bg-error-bg hover:border-error
                             active:scale-[0.97]
                             transition-all duration-150
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40 focus-visible:ring-offset-1"
                >
                  로그아웃
                </button>
              </div>
            </div>

            {/* 푸터 */}
            <footer className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[12px] text-ink-subtle order-2 sm:order-1">
                © 2026 CluePot. All rights reserved.
              </span>
              <div className="flex gap-5 order-1 sm:order-2">
                <a
                  href="#"
                  className="text-[12px] text-ink-subtle hover:text-ink transition-colors duration-150
                             focus-visible:outline-none focus-visible:underline underline-offset-2"
                >
                  개인정보처리방침
                </a>
                <a
                  href="#"
                  className="text-[12px] text-ink-subtle hover:text-ink transition-colors duration-150
                             focus-visible:outline-none focus-visible:underline underline-offset-2"
                >
                  이용약관
                </a>
              </div>
            </footer>
          </div>

          {/* ── 우열: 미리보기 패널 (lg+에서만 표시) ── */}
          <div
            className="hidden lg:flex flex-col gap-5 sticky top-6"
            style={{ animation: "fade-up 0.4s ease-out 0.18s both" }}
          >

            {/* 참가자 미리보기 카드 */}
            <div className="bg-surface rounded-2xl border border-hairline overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="p-5">
                <SectionLabel
                  extra={
                    isDirty && (
                      <span
                        className="text-[10px] font-bold text-accent bg-accent-light px-1.5 py-0.5 rounded-full"
                        style={{ animation: "fade-up 0.15s ease-out both" }}
                      >
                        수정 중
                      </span>
                    )
                  }
                >
                  {isDirty ? "저장 후 모습" : "현재 프로필"}
                </SectionLabel>

                {/* 참가자 카드 목업 */}
                <div className="flex items-center gap-3 px-4 py-3.5 bg-surface rounded-xl border border-hairline">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <AvatarContent
                      src={displayImage}
                      initial={user.initial}
                      textClass="text-[14px]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ink truncate leading-snug">
                      {nickname || "닉네임 없음"}
                    </p>
                    <p className="text-[11px] text-ink-subtle truncate mt-0.5">{user.email}</p>
                  </div>
                  {/* 참가자 상태 점 */}
                  <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                </div>

                <p className="text-[11px] text-ink-subtle mt-3.5 leading-relaxed">
                  모임에 참가할 때 다른 참가자들에게 이렇게 표시돼요.
                </p>
              </div>
            </div>

            {/* 계정 정보 카드 */}
            <div className="bg-surface rounded-2xl border border-hairline overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="p-5">
                <SectionLabel>계정 정보</SectionLabel>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink-subtle shrink-0">가입일</span>
                    <span className="text-[12px] font-medium text-ink text-right">{user.joinedAt}</span>
                  </div>
                  <div className="h-px bg-hairline" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink-subtle shrink-0">로그인 방식</span>
                    <span className="text-[12px] font-medium text-ink">이메일</span>
                  </div>
                  <div className="h-px bg-hairline" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink-subtle shrink-0">프로필 사진</span>
                    <span className="text-[12px] font-medium text-ink">
                      {/* previewUrl 포함해 현재 상태 반영 */}
                      {file ? "변경 예정" : user.profileImage ? "업로드됨" : "기본 이니셜"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* ── 우열 끝 ── */}

        </div>
      </div>
    </div>
  );
}
