"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { ProcessDataPoint } from "@/types/process";
import type { EChartsOption } from "echarts";

export type TimeWindow = 0.5 | 1 | 5; // minutes (0.5 = 30 seconds)

interface SparklineChartProps {
  data: ProcessDataPoint[];
  metricKey: "flow_gpm" | "power_kW" | "pressure_psi";
  thresholds: {
    min: number;
    max: number;
    warn: number;
  };
  unit: string;
  timeWindow: TimeWindow;
  onTimeWindowChange: (window: TimeWindow) => void;
  height?: number;
  isDarkMode?: boolean;
}

export function SparklineChart({
  data,
  metricKey,
  thresholds,
  unit,
  timeWindow,
  onTimeWindowChange,
  height = 110,
  isDarkMode = false,
}: SparklineChartProps) {
  // Convert data to chart format
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Convert to chart format: [timestamp, value]
    const rawPoints = data.map(
      (point) =>
        [new Date(point.timestamp).getTime(), point[metricKey] as number] as [
          number,
          number
        ]
    );

    return rawPoints;
  }, [data, metricKey]);

  // Use consistent cyan color for sparkline
  const lineColor = isDarkMode ? "#22d3ee" : "#06b6d4"; // Cyan

  // Calculate fixed time range for x-axis
  const timeRange = useMemo(() => {
    const now = Date.now();
    const windowMs = timeWindow * 60 * 1000; // Convert minutes to milliseconds
    return {
      min: now - windowMs,
      max: now,
    };
  }, [timeWindow, data]); // Re-calculate when data updates to keep "now" current

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      backgroundColor: "transparent",
      grid: {
        left: 20,
        right: 40,
        top: 10,
        bottom: 25,
      },
      xAxis: {
        type: "time",
        min: timeRange.min,
        max: timeRange.max,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: thresholds.min,
        max: thresholds.max,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: "line",
          data: chartData,
          lineStyle: {
            color: lineColor,
            width: 2.5,
          },
          itemStyle: {
            color: lineColor,
          },
          symbol: "none",
          smooth: true,
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: {
              type: "solid",
              color: isDarkMode ? "#64748b" : "#94a3b8",
              width: 1.5,
            },
            label: {
              position: "end",
              color: isDarkMode ? "#94a3b8" : "#64748b",
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              padding: [2, 4],
            },
            data: [
              {
                yAxis: thresholds.max,
                label: { formatter: `${thresholds.max}` },
              },
              {
                yAxis: thresholds.min,
                label: { formatter: `${thresholds.min}` },
              },
            ],
          },
        },
      ],
      tooltip: {
        trigger: "axis",
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        textStyle: {
          color: isDarkMode ? "#f1f5f9" : "#0f172a",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const point = params[0];
          const date = new Date(point.value[0]);
          const value = point.value[1].toFixed(1);
          return `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <div>${date.toLocaleTimeString()}</div>
              <div style="font-weight: bold; margin-top: 4px;">
                ${value} ${unit}
              </div>
            </div>
          `;
        },
      },
    }),
    [chartData, lineColor, thresholds, unit, isDarkMode, timeRange]
  );

  const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
    { value: 0.5, label: "30s" },
    { value: 1, label: "1m" },
    { value: 5, label: "5m" },
  ];

  return (
    <div className="relative">
      {/* Time Window Selector - Left Side */}
      <div className="absolute top-1 left-1 z-10 flex gap-1">
        {TIME_WINDOW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTimeWindowChange(opt.value)}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
              timeWindow === opt.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ReactECharts
        option={option}
        style={{ height: `${height}px`, width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
}
