"use client";

import { DistanceTolerance } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";

/* ── 거리별 인라인 SVG 아이콘 ── */
function IconShort() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v14M10 3l-3 3M10 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 13l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
    </svg>
  );
}
function IconMedium() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="5" r="1.5" fill="currentColor"/>
      <path d="M7.5 10l1-3 1.5 2 1.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 15l1-3 2 2 2-3 2.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconFar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 10h14M10 3c-2 2-3 4.5-3 7s1 5 3 7M10 3c2 2 3 4.5 3 7s-1 5-3 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

const DISTANCE_ICONS: Record<string, React.FC> = {
  short: IconShort,
  medium: IconMedium,
  far: IconFar,
};

interface DistanceOption {
  value: DistanceTolerance;
  label: string;
  desc: string;
}

const DISTANCE_OPTIONS: DistanceOption[] = [
  { value: "short",  label: "짧게",        desc: "15분 이내" },
  { value: "medium", label: "적당히",       desc: "30분 이내" },
  { value: "far",    label: "상관없어요",   desc: "멀어도 OK" },
];

interface DistancePickerProps {
  value: DistanceTolerance | null;
  onChange: (value: DistanceTolerance) => void;
}

export function DistancePicker({ value, onChange }: DistancePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {DISTANCE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = DISTANCE_ICONS[opt.value];
        return (
          <ChoiceButton
            key={opt.value}
            isSelected={isSelected}
            onClick={() => onChange(opt.value)}
            className="min-h-[78px]"
          >
            <span className={isSelected ? "text-accent" : "text-ink-subtle"}>
              <Icon />
            </span>
            <span
              className={[
                "text-[11px] font-semibold leading-tight mt-0.5",
                isSelected ? "text-accent" : "text-ink-muted",
              ].join(" ")}
            >
              {opt.label}
            </span>
            <span className="text-[10px] text-ink-subtle">{opt.desc}</span>
          </ChoiceButton>
        );
      })}
    </div>
  );
}
