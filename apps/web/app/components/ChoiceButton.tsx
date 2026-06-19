"use client";

import type React from "react";

interface ChoiceButtonProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export function ChoiceButton({
  children,
  isSelected,
  onClick,
  className,
  title,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={isSelected}
      className={[
        "flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-center transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
        "active:scale-[0.97]",
        isSelected
<<<<<<< HEAD
          ? "bg-accent-light border-accent shadow-[0_0_0_1px_#5e6ad2]"
          : "bg-canvas border-hairline hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-2",
=======
          ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7298C7]"
          : "bg-canvas border-hairline hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-white hover:shadow-sm",
>>>>>>> main
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
