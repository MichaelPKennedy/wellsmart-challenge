import { useEffect, useRef } from "react";

export interface CanvasGaugeOptions {
  value: number;
  min: number;
  max: number;
  size: number;
  width?: number;
  height?: number;
  valueColor?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  enableAnimation?: boolean;
  animationDuration?: number;
}

/**
 * Hook to manage Canvas-based gauge rendering
 * Handles HiDPI displays, DPR scaling, animation frame updates, and smooth needle animations
 */
export function useCanvasGauge(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  drawFunction: (
    ctx: CanvasRenderingContext2D,
    options: CanvasGaugeOptions
  ) => void,
  options: CanvasGaugeOptions
) {
  const currentDisplayedValueRef = useRef<number>(options.value);

  const animationStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(options.value);
  const targetValueRef = useRef<number>(options.value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle HiDPI displays with extra scaling for crisp rendering
    const dpr = Math.max(window.devicePixelRatio || 1, 2); // Use at least 2x DPR
    const width = options.width || options.size;
    const height = options.height || options.size;

    // Set internal resolution (for crisp rendering)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale drawing operations
    ctx.scale(dpr, dpr);

    const enableAnimation = options.enableAnimation !== false;
    // Increased default duration for smoother feel
    const duration = options.animationDuration || 800;

    // Update target
    targetValueRef.current = options.value;

    // If animation is enabled and we have a new target
    if (enableAnimation) {
      // Start from wherever the needle currently is
      startValueRef.current = currentDisplayedValueRef.current;

      // Reset animation start time to trigger a new interpolation from current pos
      animationStartRef.current = null;

      // Spring easing function with slight overshoot and bounce
      const easeOutElastic = (t: number) => {
        const c4 = (2 * Math.PI) / 3; // Controls bounce frequency
        return t === 0
          ? 0
          : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      };

      const animate = (timestamp: number) => {
        if (animationStartRef.current === null) {
          animationStartRef.current = timestamp;
        }

        const elapsed = timestamp - animationStartRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutElastic(progress);

        // Interpolate
        const nextValue =
          startValueRef.current +
          (targetValueRef.current - startValueRef.current) * easeProgress;

        // Update current displayed value
        currentDisplayedValueRef.current = nextValue;

        // Draw
        ctx.clearRect(0, 0, width, height);
        drawFunction(ctx, {
          ...options,
          value: nextValue,
        });

        // Continue if not reached target (or if target changed mid-flight, we keep going)
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure we land exactly on target
          currentDisplayedValueRef.current = targetValueRef.current;
          animationStartRef.current = null;
        }
      };

      // Cancel any existing loop
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Start new loop
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // No animation, jump straight to target
      currentDisplayedValueRef.current = targetValueRef.current;
      ctx.clearRect(0, 0, width, height);
      drawFunction(ctx, options);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasRef, options, drawFunction]);
}

/**
 * Get color based on value and thresholds
 */
export function getGaugeColor(
  value: number,
  max: number,
  warningThreshold: number = 0.8,
  criticalThreshold: number = 1.0
): string {
  const percentage = value / max;

  if (percentage > criticalThreshold) {
    return "#dc3545"; // Red
  }
  if (percentage > warningThreshold) {
    return "#ffc107"; // Amber
  }
  return "#28a745"; // Green
}

/**
 * Draw text with better rendering
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number = 16,
  color: string = "#212529",
  align: CanvasTextAlign = "center"
) {
  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

/**
 * Format number with decimal places
 */
export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}
