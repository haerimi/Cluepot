"use client";

import { logout, updateUserInfo } from "@/app/actions/auth";
import { createClient } from "@/util/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type UserInfo = {
  id: string;
  initial: string;
  joinedAt: string;
  nickname: string;
  email: string;
  profileImage: string | null;
};

export default function ProfileClient({ user }: Readonly<{ user: UserInfo }>) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function handleEditInfo(nickname: string, file: File | null): Promise<void> {
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
    setEditModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-10">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-hairline-strong" />
            <span className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase">
              프로필
            </span>
          </div>
          <h1 className="text-[32px] lg:text-[40px] font-black text-ink leading-tight tracking-[-1.5px]">
            내 계정
          </h1>
        </div>

        {/* Profile card */}
        <div className="max-w-[480px] bg-white rounded-2xl border border-hairline shadow-[0_2px_8px_rgba(26,32,51,0.06)] overflow-hidden">
          {/* Avatar band */}
          <div className="bg-ink px-8 py-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0 overflow-hidden">
              {user.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[24px] font-black text-white leading-none">
                  {user.initial}
                </span>
              )}
            </div>
            <div>
              {user.nickname && (
                <p className="text-[18px] font-bold text-white leading-tight">
                  {user.nickname}
                </p>
              )}
              <p className="text-[13px] text-ink-subtle">{user.email}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="divide-y divide-[#F0EDE7]">
            <Row label="이메일" value={user.email} />
            {user.nickname && <Row label="닉네임" value={user.nickname} />}
            <Row label="가입일" value={user.joinedAt} />
          </div>

          {/* Actions */}
          <div className="px-6 py-5 bg-surface border-t border-hairline">
            <div className="flex gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="h-10 px-8 text-[13px] font-medium text-accent-light rounded-full bg-accent-active hover:bg-accent-hover transition-colors cursor-pointer"
              >
                수정
              </button>
              <button
                onClick={logout}
                className="h-10 px-5 text-[13px] font-medium text-error border border-error-border rounded-full bg-white hover:bg-error-bg transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditProfileModal
          currentNickname={user.nickname}
          onCancel={() => setEditModalOpen(false)}
          onConfirm={handleEditInfo}
          imageUrl={user.profileImage}
        />
      )}
    </>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <span className="text-[11px] font-semibold text-ink-subtle uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="text-[14px] text-ink text-right truncate">
        {value}
      </span>
    </div>
  );
}

function EditProfileModal({
  currentNickname,
  onCancel,
  onConfirm,
  imageUrl,
}: Readonly<{
  currentNickname: string;
  onCancel: () => void;
  onConfirm: (nickname: string, file: File | null) => Promise<void>;
  imageUrl: string | null;
}>) {
  const [name, setName] = useState(currentNickname);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // previewUrl이 교체되거나 모달이 닫힐 때 Object URL을 해제해 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Esc 키로 모달 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onCancel]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSave() {
    setSaveError(null);
    setIsSaving(true);
    try {
      await onConfirm(name, file);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      <button
        type="button"
        aria-label="취소"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={isSaving ? undefined : onCancel}
      />
      <dialog
        open
        aria-labelledby="edit-profile-modal-title"
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8 flex flex-col gap-5 m-0 p-0"
        style={{ animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto -mb-1" />
        <h3 id="edit-profile-modal-title" className="text-[18px] font-black text-ink text-center tracking-tight">
          프로필 수정
        </h3>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-image-upload" className="text-[13px] font-semibold text-ink-subtle">프로필 사진</label>
          <label htmlFor="profile-image-upload" className="cursor-pointer group">
            <input id="profile-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            {(previewUrl ?? imageUrl) ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-hairline">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl ?? imageUrl ?? ""}
                  alt="프로필 이미지 미리보기"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-[12px] font-semibold transition-opacity">
                    사진 변경
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-[12px] font-semibold text-black/40 bg-surface-3 rounded-full px-3 py-1.5">
                사진 선택
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-nickname" className="text-[13px] font-semibold text-ink-subtle">
            닉네임
          </label>
          <input
            id="edit-nickname"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="닉네임을 입력하세요"
            className="h-11 rounded-xl border border-hairline px-3.5 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-2 pt-1">
            <button
              onClick={isSaving ? undefined : onCancel}
              disabled={isSaving}
              className="flex-1 h-11 rounded-xl border border-hairline text-[14px] font-semibold text-ink-muted hover:bg-surface-3 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-11 rounded-xl bg-accent-active text-white text-[14px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                  <span>저장 중...</span>
                </>
              ) : "저장"}
            </button>
          </div>
          {saveError && (
            <p className="text-red-400 text-xs mt-1 text-center">{saveError}</p>
          )}
        </div>
      </dialog>
    </div>
  );
}
