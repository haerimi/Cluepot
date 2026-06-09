"use client";

import { useState, useEffect, useRef } from "react";

interface LocationResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationSearchInputProps {
  value: string;
  onSelect: (result: LocationResult) => void;
  error?: boolean;
}

export function LocationSearchInput({
  value,
  onSelect,
  error = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    skipSearchRef.current = true;
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Abort any in-flight request from a previous query before starting a new one
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsLoading(true);
      try {
        const res = await fetch(`/api/location-search?q=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error(`location-search ${res.status}`);
        const data: LocationResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: LocationResult) {
    skipSearchRef.current = true;
    setQuery(result.name);
    setIsOpen(false);
    setResults([]);
    onSelect(result);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 강남구, 홍대, 잠실"
          className={[
            "w-full h-12 px-4 pr-10 rounded-xl border text-[16px]",
            "placeholder:text-ink-tertiary",
            "outline-none transition-all duration-150",
            "focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent",
            error
              ? "border-error bg-error-bg"
              : "border-hairline bg-canvas focus:bg-white",
          ].join(" ")}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="#9AAABF" strokeWidth="1.5" />
              <path d="M10.5 10.5L13 13" stroke="#9AAABF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-hairline rounded-xl shadow-md overflow-hidden">
          {results.map((r, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full flex flex-col items-start px-4 py-3 text-left hover:bg-surface transition-colors"
              >
                <span className="text-[14px] font-medium text-ink">{r.name}</span>
                <span className="text-[12px] text-ink-subtle mt-0.5">{r.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
