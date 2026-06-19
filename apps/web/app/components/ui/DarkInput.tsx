"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface DarkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const DarkInput = forwardRef<HTMLInputElement, DarkInputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-ink-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full h-11 bg-surface border border-hairline rounded-lg text-[14px] text-ink placeholder:text-ink-tertiary",
              "transition-all duration-150",
              "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(94,106,210,0.12)]",
              "hover:border-hairline-strong",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              icon ? "pl-9 pr-3" : "px-3",
              error ? "border-error-border focus:border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]" : "",
              className,
            ].filter(Boolean).join(" ")}
            {...props}
          />
        </div>
        {error && <p className="text-[12px] text-error">{error}</p>}
        {!error && hint && <p className="text-[12px] text-ink-subtle">{hint}</p>}
      </div>
    );
  },
);

DarkInput.displayName = "DarkInput";
