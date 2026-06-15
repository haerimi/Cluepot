"use client";

import { AtmospherePreference } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";

interface AtmosphereOption {
  value: AtmospherePreference;
  label: string;
  emoji: string;
}

const ATMOSPHERE_OPTIONS: AtmosphereOption[] = [
  { value: "quiet",  label: "조용한",   emoji: "☕" },
  { value: "lively", label: "활기찬",   emoji: "🎵" },
  { value: "cozy",   label: "아늑한",   emoji: "🕯" },
  { value: "trendy", label: "트렌디한", emoji: "✨" },
];

interface AtmospherePickerProps {
  value: AtmospherePreference | null;
  onChange: (value: AtmospherePreference) => void;
}

export function AtmospherePicker({ value, onChange }: AtmospherePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {ATMOSPHERE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <ChoiceButton
            key={opt.value}
            isSelected={isSelected}
            onClick={() => onChange(opt.value)}
            className="min-h-[76px]"
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
          </ChoiceButton>
        );
      })}
    </div>
  );
}
