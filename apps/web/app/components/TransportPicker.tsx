"use client";

import { Transport } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";
<<<<<<< HEAD

/* ── 이동수단별 인라인 SVG 아이콘 ── */
function IconWalk() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
      <path d="M7 9l1.5-3.5 2 2 2-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 14l1-3.5L9 12l2-3 2.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconTransit() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 9h12" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 16l1-2M13 16l-1-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="7.5" cy="11.5" r="0.8" fill="currentColor"/>
      <circle cx="12.5" cy="11.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function IconCar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 10l2-4h10l2 4v4H3v-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="14" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconBike() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="14.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 13.5L9 7h4l1.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 7l2 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="12" cy="5.5" r="1" fill="currentColor"/>
    </svg>
  );
}

const TRANSPORT_ICONS: Record<string, React.FC> = {
  walk: IconWalk,
  transit: IconTransit,
  car: IconCar,
  bike: IconBike,
};
=======
>>>>>>> main

interface TransportOption {
  value: Transport;
  label: string;
}

const TRANSPORTS: TransportOption[] = [
  { value: "walk",    label: "도보" },
  { value: "transit", label: "대중교통" },
  { value: "car",     label: "자가용" },
  { value: "bike",    label: "자전거" },
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
        const Icon = TRANSPORT_ICONS[t.value];
        return (
          <ChoiceButton
            key={t.value}
            title={t.label}
            isSelected={isSelected}
            onClick={() => onChange(t.value)}
<<<<<<< HEAD
            className="relative min-h-[76px]"
=======
            className="relative min-h-[76px] bg-white hover:bg-surface"
>>>>>>> main
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
            <span className={isSelected ? "text-accent" : "text-ink-subtle"}>
              <Icon />
            </span>
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
