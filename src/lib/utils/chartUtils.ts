import type { ProcessDataPoint } from "@/types/process";
import type { TimeWindow } from "@/components/charts/SparklineChart";
import type { MetricCardStatus } from "@/components/ui/MetricCard";

/**
 * Filters historical data to only include points within the specified time window,
 * anchored to the most recent data point (not current clock time).
 */
export function getDataByTimeWindow(
  historicalData: ProcessDataPoint[],
  timeWindow: TimeWindow
): ProcessDataPoint[] {
  if (historicalData.length === 0) return [];

  const latestTimestamp = new Date(
    historicalData[historicalData.length - 1].timestamp
  ).getTime();
  const windowMs = timeWindow * 60 * 1000;
  const cutoffTime = latestTimestamp - windowMs;

  return historicalData.filter((point) => {
    const timestamp = new Date(point.timestamp).getTime();
    return timestamp >= cutoffTime;
  });
}

/**
 * Determines the status of a metric based on whether it falls within acceptable thresholds.
 */
export function getMetricStatus(
  value: number,
  thresholds: { min: number; max: number }
): MetricCardStatus {
  if (value > thresholds.max || value < thresholds.min) {
    return "error";
  }
  return "ok";
}
