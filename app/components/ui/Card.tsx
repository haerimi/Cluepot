import { HTMLAttributes, forwardRef } from "react";

type Elevation = "flat" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  padding?: "none" | "sm" | "md" | "lg";
}

const elevationStyles: Record<Elevation, string> = {
  flat: "bg-white border border-[#E5E1D9]",
  sm: "bg-white border border-[#E5E1D9] shadow-[0_1px_3px_rgba(28,26,23,0.08),0_1px_2px_-1px_rgba(28,26,23,0.05)]",
  md: "bg-white border border-[#E5E1D9] shadow-[0_4px_12px_-2px_rgba(28,26,23,0.10),0_2px_4px_-2px_rgba(28,26,23,0.06)]",
  lg: "bg-white border border-[#E5E1D9] shadow-[0_10px_32px_-4px_rgba(28,26,23,0.12),0_4px_8px_-4px_rgba(28,26,23,0.08)]",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { elevation = "sm", padding = "md", className = "", children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-xl",
          elevationStyles[elevation],
          paddingStyles[padding],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
