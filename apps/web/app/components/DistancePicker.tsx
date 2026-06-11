"use client";

import { DistanceTolerance } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";

interface DistanceOption {
  value: DistanceTolerance;
  label: string;
  emoji: string;
  desc: string;
}

const DISTANCE_OPTIONS: DistanceOption[] = [
  { value: "short",  label: "짧게",        emoji: "⚡", desc: "15분 이내" },
  { value: "medium", label: "적당히",       emoji: "🚶", desc: "30분 이내" },
  { value: "far",    label: "상관없어요",   emoji: "🗺", desc: "멀어도 OK" },
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
        return (
          <ChoiceButton
            key={opt.value}
            isSelected={isSelected}
            onClick={() => onChange(opt.value)}
            className="min-h-[78px]"
          >
            <span className="text-xl leading-none">{opt.emoji}</span>
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
