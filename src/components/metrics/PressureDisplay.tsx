"use client";

import React, { useRef, useMemo, useState } from "react";
import { useCanvasGauge } from "@/hooks/useCanvasGauge";
import { useProcessStore } from "@/stores/useProcessStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  SparklineChart,
  type TimeWindow,
} from "@/components/charts/SparklineChart";
import { DEFAULT_THRESHOLDS } from "@/types/process";
import { getDataByTimeWindow, getMetricStatus } from "@/lib/utils/chartUtils";

const WIDTH = 300;
const HEIGHT = 175;
const RADIUS = 106;

function drawPressureGauge(
  ctx: CanvasRenderingContext2D,
  psi: number,
  max: number = 150,
  isDarkMode: boolean = false
) {
  const centerX = WIDTH / 2;
  const centerY = HEIGHT - 50;
  const percentage = Math.min(psi, max) / max;

  // Clear background
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const trackColor = isDarkMode ? "#1f2937" : "#e2e8f0";
  const progressColor = isDarkMode ? "#22d3ee" : "#06b6d4"; // Cyan
  const textColor = isDarkMode ? "#f1f5f9" : "#0f172a";
  const labelColor = isDarkMode ? "#94a3b8" : "#64748b";

  // Background Arc (Track)
  ctx.beginPath();
  ctx.arc(centerX, centerY, RADIUS, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 18;
  ctx.strokeStyle = trackColor;
  ctx.lineCap = "butt";
  ctx.stroke();

  // Progress Arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, RADIUS, Math.PI, Math.PI + percentage * Math.PI);
  ctx.lineWidth = 18;
  ctx.strokeStyle = progressColor;
  ctx.lineCap = "butt";
  ctx.stroke();

  // Needle (Simple Line)
  const needleAngle = Math.PI + percentage * Math.PI;
  const needleLength = RADIUS - 25;
  const needleX = centerX + Math.cos(needleAngle) * needleLength;
  const needleY = centerY + Math.sin(needleAngle) * needleLength;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.lineWidth = 5;
  ctx.strokeStyle = isDarkMode ? "#fff" : "#0f172a";
  ctx.lineCap = "round";
  ctx.stroke();

  // Center Pivot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = isDarkMode ? "#fff" : "#0f172a";
  ctx.fill();

  // Value Text
  ctx.font = "bold 40px 'JetBrains Mono', monospace";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.round(psi).toString(), centerX, centerY - 50);

  // Unit Text
  ctx.font = "15px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.fillText("PSI", centerX, centerY - 25);

  // Min/Max Labels
  ctx.font = "15px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.textAlign = "left";
  ctx.fillText("0", centerX - RADIUS + 12, centerY + 19);
  ctx.textAlign = "right";
  ctx.fillText(max.toString(), centerX + RADIUS - 12, centerY + 19);
}

export function PressureDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(0.5);
  const pressurePsi = useProcessStore(
    (state) => state.currentData?.pressure_psi ?? 0
  );
  const historicalData = useProcessStore((state) => state.historicalData);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const filteredData = useMemo(
    () => getDataByTimeWindow(historicalData, timeWindow),
    [historicalData, timeWindow]
  );

  // Determine status based on current value
  const cardStatus = useMemo(
    () => getMetricStatus(pressurePsi, DEFAULT_THRESHOLDS.pressure_psi),
    [pressurePsi]
  );

  useCanvasGauge(
    canvasRef,
    (ctx) => drawPressureGauge(ctx, pressurePsi, 150, isDarkMode),
    {
      value: pressurePsi,
      min: 0,
      max: 150,
      size: WIDTH,
      width: WIDTH,
      height: HEIGHT,
      enableAnimation: true,
      animationDuration: 300,
    }
  );

  return (
    <MetricCard
      title="Pressure"
      noPadding
      status={cardStatus}
      className="flex flex-col items-center justify-center py-4"
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
      <div className="w-full px-4 pb-4 mt-2">
        <SparklineChart
          data={filteredData}
          metricKey="pressure_psi"
          thresholds={DEFAULT_THRESHOLDS.pressure_psi}
          unit="PSI"
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          height={150}
          isDarkMode={isDarkMode}
        />
      </div>
    </MetricCard>
  );
}
