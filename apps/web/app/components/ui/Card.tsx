import { HTMLAttributes, forwardRef } from "react";

type Elevation = "flat" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  padding?: "none" | "sm" | "md" | "lg";
}

const elevationStyles: Record<Elevation, string> = {
  flat: "bg-surface border border-hairline",
  sm:   "bg-surface border border-hairline",
  md:   "bg-surface-2 border border-hairline",
  lg:   "bg-surface-2 border border-hairline-strong",
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
