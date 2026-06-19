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
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-active shadow-[0_1px_3px_rgba(94,106,210,0.3)] hover:shadow-[0_2px_8px_rgba(94,106,210,0.35)] disabled:bg-ink-subtle disabled:shadow-none",
  secondary:
    "bg-surface text-ink border border-hairline hover:border-hairline-strong hover:bg-surface-2 active:bg-surface-3 disabled:opacity-40",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-2 active:bg-surface-3 disabled:opacity-40",
  danger:
    "bg-surface text-error border border-error-border hover:bg-error-bg disabled:opacity-40",
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
