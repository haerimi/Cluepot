import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "butter" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-warm text-ink-muted",
  accent:  "bg-accent-light text-accent",
  butter:  "bg-butter text-ink",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  muted:   "bg-surface-warm text-ink-subtle",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-ink-subtle",
  accent:  "bg-accent",
  butter:  "bg-ink",
  success: "bg-success",
  warning: "bg-warning",
  muted:   "bg-ink-subtle",
};

export function Badge({
  variant = "default",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium leading-5",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && (
        <span
          className={[
            "inline-block w-1.5 h-1.5 rounded-full",
            dotColors[variant],
          ].join(" ")}
        />
      )}
      {children}
    </span>
  );
}
