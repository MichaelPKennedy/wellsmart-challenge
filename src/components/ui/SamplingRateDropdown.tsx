"use client";

import {
  useSamplingRateStore,
  type SamplingRate,
} from "@/stores/useSamplingRateStore";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const SAMPLING_OPTIONS: { value: SamplingRate; label: string }[] = [
  { value: 16, label: "16ms (Real-time)" },
  { value: 50, label: "50ms" },
  { value: 100, label: "100ms" },
  { value: 200, label: "200ms" },
];

export function SamplingRateDropdown() {
  const samplingRate = useSamplingRateStore((state) => state.samplingRate);
  const setSamplingRate = useSamplingRateStore(
    (state) => state.setSamplingRate
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    SAMPLING_OPTIONS.find((opt) => opt.value === samplingRate)?.label ||
    "100ms";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>Sampling: {currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {SAMPLING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSamplingRate(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                samplingRate === option.value
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
