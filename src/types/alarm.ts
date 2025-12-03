export type AlarmSeverity = 'critical' | 'warning' | 'info';

export interface Alarm {
  id: string;
  timestamp: string; // ISO 8601
  message: string;
  severity: AlarmSeverity;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface AlarmEvent {
  triggeredAt: string;
  resolvedAt?: string;
  duration?: number; // milliseconds
}

export const ALARM_COLORS: Record<AlarmSeverity, string> = {
  critical: '#dc3545', // Red
  warning: '#ffc107', // Amber
  info: '#0d6efd', // Blue
};

export function getAlarmColor(severity: AlarmSeverity): string {
  return ALARM_COLORS[severity];
}
