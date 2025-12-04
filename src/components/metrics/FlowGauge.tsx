"use client";

import React, { useRef, useMemo, useState } from "react";
import { useCanvasGauge } from "@/hooks/useCanvasGauge";
import { useProcessStore } from "@/stores/useProcessStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { MetricCard, type MetricCardStatus } from "@/components/ui/MetricCard";
import {
  SparklineChart,
  type TimeWindow,
} from "@/components/charts/SparklineChart";
import { DEFAULT_THRESHOLDS, type ProcessDataPoint } from "@/types/process";

const SIZE = 300;
const RADIUS = 106;

function getDataByTimeWindow(
  historicalData: ProcessDataPoint[],
  timeWindow: TimeWindow
): ProcessDataPoint[] {
  if (historicalData.length === 0) return [];

  const latestTimestamp = new Date(
    historicalData[historicalData.length - 1].timestamp
  ).getTime();
  const windowMs = timeWindow * 60 * 1000;
  const cutoffTime = latestTimestamp - windowMs;

  const filtered = historicalData.filter((point) => {
    const timestamp = new Date(point.timestamp).getTime();
    return timestamp >= cutoffTime;
  });

  // Debug logging
  if (filtered.length !== historicalData.length) {
    console.log(
      `[FlowGauge] ${timeWindow}m window: ${filtered.length}/${
        historicalData.length
      } points. Cutoff: ${new Date(cutoffTime).toISOString()}`
    );
  }

  return filtered;
}

function drawFlowGauge(
  ctx: CanvasRenderingContext2D,
  value: number,
  max: number = 1200,
  isDarkMode: boolean = false
) {
  const centerX = SIZE / 2;
  const centerY = SIZE / 2;
  const percentage = Math.min(value, max) / max;

  // Clear background
  ctx.clearRect(0, 0, SIZE, SIZE);

  const trackColor = isDarkMode ? "#1f2937" : "#e2e8f0";
  const progressColor = isDarkMode ? "#22d3ee" : "#06b6d4"; // Cyan
  const textColor = isDarkMode ? "#f1f5f9" : "#0f172a";
  const labelColor = isDarkMode ? "#94a3b8" : "#64748b";

  // Arc configuration (270 degrees)
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const currentAngle = startAngle + (endAngle - startAngle) * percentage;

  // Background Arc (Track)
  ctx.beginPath();
  ctx.arc(centerX, centerY, RADIUS, startAngle, endAngle);
  ctx.lineWidth = 18;
  ctx.strokeStyle = trackColor;
  ctx.lineCap = "round";
  ctx.stroke();

  // Progress Arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, RADIUS, startAngle, currentAngle);
  ctx.lineWidth = 18;
  ctx.strokeStyle = progressColor;
  ctx.lineCap = "round";
  ctx.stroke();

  // Value Text
  ctx.font = "bold 45px 'JetBrains Mono', monospace";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.round(value).toString(), centerX, centerY);

  // Unit Text
  ctx.font = "15px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.fillText("GPM", centerX, centerY + 31);

  // Min/Max Labels
  ctx.font = "15px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;

  // Calculate position for 0 (start)
  const startX = centerX + Math.cos(startAngle) * (RADIUS + 25);
  const startY = centerY + Math.sin(startAngle) * (RADIUS + 25);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("0", startX, startY);

  // Calculate position for max (end)
  const endX = centerX + Math.cos(endAngle) * (RADIUS + 25);
  const endY = centerY + Math.sin(endAngle) * (RADIUS + 25);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(max.toString(), endX, endY);
}

export function FlowGauge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(0.5);
  const currentFlow = useProcessStore(
    (state) => state.currentData?.flow_gpm ?? 0
  );
  const historicalData = useProcessStore((state) => state.historicalData);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const filteredData = useMemo(
    () => getDataByTimeWindow(historicalData, timeWindow),
    [historicalData, timeWindow]
  );

  // Custom thresholds for sparkline (operating range: 600-1200)
  const sparklineThresholds = useMemo(
    () => ({
      ...DEFAULT_THRESHOLDS.flow_gpm,
      min: 600,
      max: 1200,
    }),
    []
  );

  // Determine status based on current value
  const cardStatus: MetricCardStatus = useMemo(() => {
    if (
      currentFlow > sparklineThresholds.max ||
      currentFlow < sparklineThresholds.min
    ) {
      return "error";
    }
    return "ok";
  }, [currentFlow, sparklineThresholds.max, sparklineThresholds.min]);

  useCanvasGauge(
    canvasRef,
    (ctx) => drawFlowGauge(ctx, currentFlow, 1200, isDarkMode),
    {
      value: currentFlow,
      min: 0,
      max: 1200,
      size: SIZE,
      enableAnimation: true,
      animationDuration: 1000,
    }
  );

  return (
    <MetricCard
      title="Flow Rate"
      noPadding
      status={cardStatus}
      className="flex flex-col items-center justify-center py-4"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: SIZE,
          height: SIZE,
          border: "none",
        }}
      />
      <div className="w-full px-4 pb-4">
        <SparklineChart
          data={filteredData}
          metricKey="flow_gpm"
          thresholds={sparklineThresholds}
          unit="GPM"
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          height={110}
          isDarkMode={isDarkMode}
        />
      </div>
    </MetricCard>
  );
}
