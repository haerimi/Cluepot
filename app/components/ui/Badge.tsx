import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#F0EDE7] text-[#4A4740]",
  accent:  "bg-accent-light text-accent",
  success: "bg-[#E8F5EC] text-[#1A7A35]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  muted:   "bg-[#F0EDE7] text-[#908D87]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[#908D87]",
  accent:  "bg-accent",
  success: "bg-[#27A644]",
  warning: "bg-[#D97706]",
  muted:   "bg-[#C4C1BC]",
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
