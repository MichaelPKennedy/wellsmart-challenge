export interface ProcessData {
  flow_gpm: number;
  power_kW: number;
  pressure_psi: number;
  pressure_bar: number;
  sensor_alarm: boolean;
  timestamp: string; // ISO 8601 format
  message_type: 'process_data';
}

export interface ProcessDataPoint extends ProcessData {
  id: string; // UUID for IndexedDB
  clientTimestamp: number; // Performance.now() for latency tracking
}

export interface MetricThresholds {
  flow_gpm: { min: number; max: number; warn: number; low_warn?: number };
  power_kW: { min: number; max: number; warn: number; low_warn?: number };
  pressure_psi: { min: number; max: number; warn: number; low_warn?: number };
  pressure_bar: { min: number; max: number; warn: number; low_warn?: number };
}

export const DEFAULT_THRESHOLDS: MetricThresholds = {
  flow_gpm: { min: 0, max: 1200, warn: 1000, low_warn: 200 },
  power_kW: { min: 0, max: 600, warn: 500, low_warn: 100 },
  pressure_psi: { min: 0, max: 150, warn: 120, low_warn: 30 },
  pressure_bar: { min: 0, max: 10.3, warn: 8.3, low_warn: 2.0 },
};

export type MetricKey = 'flow_gpm' | 'power_kW' | 'pressure_psi' | 'pressure_bar';

export type StatusType = 'ok' | 'warning' | 'error' | 'offline';

export function getStatus(value: number, metric: MetricKey): StatusType {
  const thresholds = DEFAULT_THRESHOLDS[metric];
  if (value > thresholds.max || value < thresholds.min) {
    return 'error';
  }
  if (value > thresholds.warn) {
    return 'warning';
  }
  return 'ok';
}
