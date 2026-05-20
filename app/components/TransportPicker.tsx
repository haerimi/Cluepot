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
  value: Transport[];
  onChange: (transports: Transport[]) => void;
}

export function TransportPicker({ value, onChange }: TransportPickerProps) {
  function toggle(transport: Transport) {
    if (value.includes(transport)) {
      onChange(value.filter((t) => t !== transport));
    } else {
      onChange([...value, transport]);
    }
  }

  return (
    <div className="flex gap-2">
      {TRANSPORTS.map((t) => {
        const isSelected = value.includes(t.value);
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            title={t.label}
            aria-pressed={isSelected}
            className={[
              "relative flex flex-col items-center gap-1 flex-1 py-3 rounded-[10px] border text-center transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              isSelected
                ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7C5CFC]"
                : "bg-white border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6]",
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
                isSelected ? "text-accent" : "text-[#908D87]",
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
