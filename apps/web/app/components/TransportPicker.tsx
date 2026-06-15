"use client";

import { Transport } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";

interface TransportOption {
  value: Transport;
  label: string;
  emoji: string;
}

const TRANSPORTS: TransportOption[] = [
  { value: "walk",    label: "도보",     emoji: "🚶" },
  { value: "transit", label: "대중교통", emoji: "🚇" },
  { value: "car",     label: "자가용",   emoji: "🚗" },
  { value: "bike",    label: "자전거",   emoji: "🚲" },
];

interface TransportPickerProps {
  value: Transport | null;
  onChange: (transport: Transport) => void;
}

export function TransportPicker({ value, onChange }: TransportPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {TRANSPORTS.map((t) => {
        const isSelected = value === t.value;
        return (
          <ChoiceButton
            key={t.value}
            title={t.label}
            isSelected={isSelected}
            onClick={() => onChange(t.value)}
            className="relative min-h-[76px] bg-white hover:bg-surface"
          >
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
                <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                  <path
                    d="M1 2.8L2.8 4.8L6 1"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
            <span className="text-xl leading-none">{t.emoji}</span>
            <span
              className={[
                "text-[11px] font-medium leading-tight mt-0.5",
                isSelected ? "text-accent" : "text-ink-subtle",
              ].join(" ")}
            >
              {t.label}
            </span>
          </ChoiceButton>
        );
      })}
    </div>
  );
}
