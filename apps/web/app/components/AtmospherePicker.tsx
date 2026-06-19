"use client";

import { AtmospherePreference } from "@/types/participant";
import { ChoiceButton } from "@/app/components/ChoiceButton";

/* ── 분위기별 인라인 SVG 아이콘 ── */
function IconQuiet() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7.5 12.5c.7.7 1.5 1 2.5 1s1.8-.3 2.5-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="9" r="0.8" fill="currentColor"/>
      <circle cx="12" cy="9" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function IconLively() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 3v8a3 3 0 11-2-2.83V3h2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 6h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconCozy() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3c0 0-1 2-.5 3.5S11 9 10 10.5s-2 2-1.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M13 5c0 0-.8 1.5-.4 2.8S14 10 13 11.2s-1.6 1.6-1.2 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 6c0 0-.8 1.3-.3 2.5S8 11 7 12s-1.4 1.2-1 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 16h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconTrendy() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 12l-4 2.5 1.5-4.5L4 7.5h4.5L10 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

const ATMOSPHERE_ICONS: Record<string, React.FC> = {
  quiet: IconQuiet,
  lively: IconLively,
  cozy: IconCozy,
  trendy: IconTrendy,
};

interface AtmosphereOption {
  value: AtmospherePreference;
  label: string;
}

const ATMOSPHERE_OPTIONS: AtmosphereOption[] = [
  { value: "quiet",  label: "조용한" },
  { value: "lively", label: "활기찬" },
  { value: "cozy",   label: "아늑한" },
  { value: "trendy", label: "트렌디한" },
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
        const Icon = ATMOSPHERE_ICONS[opt.value];
        return (
          <ChoiceButton
            key={opt.value}
            isSelected={isSelected}
            onClick={() => onChange(opt.value)}
            className="min-h-[76px]"
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
          </ChoiceButton>
        );
      })}
    </div>
  );
}
