"use client";

import { Transport } from "@/types/participant";

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
    <div className="flex gap-2">
      {TRANSPORTS.map((t) => {
        const isSelected = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            title={t.label}
            aria-pressed={isSelected}
            className={[
              "relative flex flex-col items-center gap-1 flex-1 py-3 rounded-[10px] border text-center transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              isSelected
                ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7298C7]"
                : "bg-white border-hairline hover:border-hairline-strong hover:bg-surface",
            ]
              .filter(Boolean)
              .join(" ")}
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
          </button>
        );
      })}
    </div>
  );
}
