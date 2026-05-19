"use client";

import { Transport } from "@/types/participant";

interface TransportOption {
  value: Transport;
  label: string;
  emoji: string;
}

const TRANSPORTS: TransportOption[] = [
  { value: "walk", label: "도보", emoji: "🚶" },
  { value: "transit", label: "대중교통", emoji: "🚇" },
  { value: "car", label: "자가용", emoji: "🚗" },
  { value: "bike", label: "자전거", emoji: "🚲" },
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
            className={[
              "flex flex-col items-center gap-1 flex-1 py-3 rounded-[10px] border text-center transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1",
              isSelected
                ? "bg-[#FFF0E8] border-[#FF5C00] shadow-[0_0_0_1px_#FF5C00]"
                : "bg-white border-[#E5E1D9] hover:border-[#D0CCC4] hover:bg-[#FAF9F6]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="text-xl leading-none">{t.emoji}</span>
            <span
              className={[
                "text-[11px] font-medium leading-tight mt-0.5",
                isSelected ? "text-[#FF5C00]" : "text-[#908D87]",
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
