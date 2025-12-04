"use client";

import React, { useRef, useMemo, useState } from "react";
import { useCanvasGauge } from "@/hooks/useCanvasGauge";
import { useProcessStore } from "@/stores/useProcessStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { MetricCard, type MetricCardStatus } from "@/components/ui/MetricCard";
import { SparklineChart, type TimeWindow } from "@/components/charts/SparklineChart";
import { DEFAULT_THRESHOLDS, type ProcessDataPoint } from "@/types/process";

const WIDTH = 250;
const HEIGHT = 100;

function getDataByTimeWindow(historicalData: ProcessDataPoint[], timeWindow: TimeWindow): ProcessDataPoint[] {
  const timeAgo = Date.now() - timeWindow * 60 * 1000;
  return historicalData.filter((point) => {
    const timestamp = new Date(point.timestamp).getTime();
    return timestamp >= timeAgo;
  });
}

function drawPowerMeter(
  ctx: CanvasRenderingContext2D,
  value: number,
  max: number = 600,
  isDarkMode: boolean = false
) {
  const percentage = Math.min(value, max) / max;

  // Clear background
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const trackColor = isDarkMode ? "#1f2937" : "#e2e8f0";
  const progressColor = isDarkMode ? "#22d3ee" : "#06b6d4"; // Cyan
  const textColor = isDarkMode ? "#f1f5f9" : "#0f172a";
  const labelColor = isDarkMode ? "#94a3b8" : "#64748b";

  const barHeight = 14;
  const barY = HEIGHT / 2 + 15;
  const barWidth = WIDTH - 40;
  const barX = 20;

  // Background Track
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2);
  ctx.fill();

  // Progress Bar
  ctx.fillStyle = progressColor;
  ctx.beginPath();
  ctx.roundRect(
    barX,
    barY,
    Math.max(barWidth * percentage, barHeight),
    barHeight,
    barHeight / 2
  );
  ctx.fill();

  // Value Text
  ctx.font = "bold 32px 'JetBrains Mono', monospace";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(Math.round(value).toString(), WIDTH / 2, barY - 10);

  // Unit Text
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.fillText("kW", WIDTH / 2, barY - 45);

  // Min/Max Labels
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("0", barX, barY + barHeight + 8);
  ctx.textAlign = "right";
  ctx.fillText(max.toString(), barX + barWidth, barY + barHeight + 8);
}

export function PowerMeter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(5);
  const currentPower = useProcessStore(
    (state) => state.currentData?.power_kW ?? 0
  );
  const historicalData = useProcessStore((state) => state.historicalData);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const filteredData = useMemo(
    () => getDataByTimeWindow(historicalData, timeWindow),
    [historicalData, timeWindow]
  );

  // Custom thresholds for sparkline (operating range: 200-600)
  const sparklineThresholds = useMemo(() => ({
    ...DEFAULT_THRESHOLDS.power_kW,
    min: 200,
    max: 600,
  }), []);

  // Determine status based on current value
  const cardStatus: MetricCardStatus = useMemo(() => {
    if (currentPower > sparklineThresholds.max || currentPower < sparklineThresholds.min) {
      return 'error';
    }
    return 'ok';
  }, [currentPower, sparklineThresholds.max, sparklineThresholds.min]);

  useCanvasGauge(
    canvasRef,
    (ctx) => drawPowerMeter(ctx, currentPower, 600, isDarkMode),
    {
      value: currentPower,
      min: 0,
      max: 600,
      size: WIDTH,
      width: WIDTH,
      height: HEIGHT,
      enableAnimation: true,
      animationDuration: 300,
    }
  );

  return (
    <MetricCard
      title="Power"
      noPadding
      status={cardStatus}
      className="flex flex-col items-center justify-center py-6"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: WIDTH,
          height: HEIGHT,
          border: "none",
        }}
      />
      <div className="w-full px-4 pb-4">
        <SparklineChart
          data={filteredData}
          metricKey="power_kW"
          thresholds={sparklineThresholds}
          unit="kW"
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          height={110}
          isDarkMode={isDarkMode}
        />
      </div>
    </MetricCard>
  );
}
