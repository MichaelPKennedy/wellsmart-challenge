"use client";

import { useState } from "react";
import { Settings, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  useSamplingRateStore,
  type SamplingRate,
} from "@/stores/useSamplingRateStore";

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const samplingRate = useSamplingRateStore((state) => state.samplingRate);
  const setSamplingRate = useSamplingRateStore(
    (state) => state.setSamplingRate
  );

  const samplingRateOptions: Array<{ value: SamplingRate; label: string }> = [
    { value: 16, label: "16ms (Real-time)" },
    { value: 50, label: "50ms" },
    { value: 100, label: "100ms" },
    { value: 200, label: "200ms" },
  ];

  return (
    <>
      {/* Gear Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-6">
                {/* Theme Setting */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        !isDarkMode
                          ? "bg-gray-900 dark:bg-gray-900 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 dark:bg-gray-900 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Sampling Rate Setting */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Data Sampling Rate
                  </label>
                  <div className="space-y-2">
                    {samplingRateOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSamplingRate(option.value)}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                          samplingRate === option.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
