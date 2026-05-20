"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-[#5A38E3] shadow-[0_1px_3px_rgba(124,92,252,0.3)] hover:shadow-[0_2px_8px_rgba(124,92,252,0.35)] disabled:bg-[#C4C1BC] disabled:shadow-none",
  secondary:
    "bg-white text-[#1C1A17] border border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6] active:bg-[#F0EDE7] disabled:opacity-40",
  ghost:
    "bg-transparent text-[#4A4740] hover:bg-[#F0EDE7] active:bg-[#E5E1D9] disabled:opacity-40",
  danger:
    "bg-white text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEF2F2] disabled:opacity-40",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] font-medium rounded-[8px]",
  md: "h-11 px-4 text-[14px] font-medium rounded-[8px]",
  lg: "h-[52px] px-5 text-[15px] font-semibold rounded-[10px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
