"use client";

import React, { useRef } from "react";
import { useCanvasGauge } from "@/hooks/useCanvasGauge";
import { useProcessStore } from "@/stores/useProcessStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { MetricCard } from "@/components/ui/MetricCard";

const WIDTH = 240;
const HEIGHT = 140;
const RADIUS = 85;

function drawPressureGauge(
  ctx: CanvasRenderingContext2D,
  psi: number,
  max: number = 150,
  isDarkMode: boolean = false
) {
  const centerX = WIDTH / 2;
  const centerY = HEIGHT - 40;
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
  ctx.lineWidth = 14; // Increased from 8
  ctx.strokeStyle = trackColor;
  ctx.lineCap = "butt";
  ctx.stroke();

  // Progress Arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, RADIUS, Math.PI, Math.PI + percentage * Math.PI);
  ctx.lineWidth = 14; // Increased from 8
  ctx.strokeStyle = progressColor;
  ctx.lineCap = "butt";
  ctx.stroke();

  // Needle (Simple Line)
  const needleAngle = Math.PI + percentage * Math.PI;
  const needleLength = RADIUS - 20;
  const needleX = centerX + Math.cos(needleAngle) * needleLength;
  const needleY = centerY + Math.sin(needleAngle) * needleLength;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = isDarkMode ? "#fff" : "#0f172a";
  ctx.lineCap = "round";
  ctx.stroke();

  // Center Pivot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
  ctx.fillStyle = isDarkMode ? "#fff" : "#0f172a";
  ctx.fill();

  // Value Text
  ctx.font = "bold 32px 'JetBrains Mono', monospace";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.round(psi).toString(), centerX, centerY - 40);

  // Unit Text
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.fillText("PSI", centerX, centerY - 20);

  // Min/Max Labels
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillStyle = labelColor;
  ctx.textAlign = "left";
  ctx.fillText("0", centerX - RADIUS + 10, centerY + 15);
  ctx.textAlign = "right";
  ctx.fillText(max.toString(), centerX + RADIUS - 10, centerY + 15);
}

export function PressureDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pressurePsi = useProcessStore(
    (state) => state.currentData?.pressure_psi ?? 0
  );
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

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
    </MetricCard>
  );
}
