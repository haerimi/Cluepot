"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface to whatever error reporting is wired up (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0 px-6 text-center"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <p
        className="text-[15px] font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        문제가 발생했어요
      </p>
      <p
        className="text-[13px]"
        style={{ color: "var(--color-ink-subtle)" }}
      >
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={() => unstable_retry()}
        style={{
          marginTop: 4,
          padding: "8px 20px",
          borderRadius: 9999,
          backgroundColor: "var(--color-accent)",
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          border: "none",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
