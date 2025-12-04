"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/storage/db";

type Timeframe = 5 | 15 | 30 | 60;

export function SessionStats() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(15);
  const [averageFlow, setAverageFlow] = useState(0);
  const [peakPower, setPeakPower] = useState(0);
  const [averagePower, setAveragePower] = useState(0);
  const [averagePressure, setAveragePressure] = useState(0);
  const [dataPoints, setDataPoints] = useState(0);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hour" },
  ];

  // Manual refresh handler
  const handleManualRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSecondsUntilRefresh(30);
  };

  // Query IndexedDB for statistics based on selected timeframe
  useEffect(() => {
    const updateStats = async () => {
      try {
        // Calculate timestamp for selected timeframe
        const timeframeMs = selectedTimeframe * 60 * 1000;
        const cutoffTime = new Date(Date.now() - timeframeMs).toISOString();

        const recentData = await db.processData
          .where("timestamp")
          .above(cutoffTime)
          .toArray();

        if (recentData.length > 0) {
          // Calculate averages
          const avgFlow =
            recentData.reduce((sum, d) => sum + d.flow_gpm, 0) /
            recentData.length;
          const avgPressure =
            recentData.reduce((sum, d) => sum + d.pressure_psi, 0) /
            recentData.length;
          const avgPower =
            recentData.reduce((sum, d) => sum + d.power_kW, 0) /
            recentData.length;
          const maxPower = Math.max(...recentData.map((d) => d.power_kW));

          setAverageFlow(avgFlow);
          setAveragePressure(avgPressure);
          setAveragePower(avgPower);
          setPeakPower(maxPower);
          setDataPoints(recentData.length);
        } else {
          // Reset stats if no data available
          setAverageFlow(0);
          setAveragePressure(0);
          setAveragePower(0);
          setPeakPower(0);
          setDataPoints(0);
        }
      } catch (err) {
        console.error("Failed to calculate stats from IndexedDB", err);
      }
    };

    // Update stats immediately and then every 30 seconds
    updateStats();
    setSecondsUntilRefresh(30);
    const interval = setInterval(() => {
      updateStats();
      setSecondsUntilRefresh(30);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe, refreshTrigger]);

  // Countdown timer for refresh indicator
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const stats = [
    {
      label: "Avg Flow Rate",
      value: averageFlow.toFixed(1),
      unit: "GPM",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Avg Power",
      value: averagePower.toFixed(1),
      unit: "kW",
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Peak Power",
      value: peakPower.toFixed(1),
      unit: "kW",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Avg Pressure",
      value: averagePressure.toFixed(1),
      unit: "PSI",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Data Points",
      value: dataPoints.toLocaleString(),
      unit: "",
      color: "text-gray-600 dark:text-gray-400",
    },
  ];

  return (
    <div className="mt-8">
      <div className="rounded-lg border border-hmi-bg-border dark:border-hmi-dark-bg-border bg-white dark:bg-hmi-dark-bg-card p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-hmi-text-primary dark:text-hmi-dark-text-primary">
              Session Statistics
            </h2>
            <div className="flex gap-2">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedTimeframe === option.value
                      ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-hmi-text-secondary dark:text-hmi-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-hmi-text-secondary dark:text-hmi-dark-text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Refresh now"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <span className="font-mono text-sm text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
              Refreshing in {secondsUntilRefresh}s
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-800/50"
            >
              <span className="text-xs text-hmi-text-secondary dark:text-hmi-dark-text-secondary mb-1">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-bold font-mono ${stat.color}`}
                >
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-sm text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
