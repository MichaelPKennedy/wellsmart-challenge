export type AlarmSeverity = 'critical' | 'warning' | 'info';
export type AlarmState = 'active' | 'cleared' | 'acknowledged' | 'resolved';

export interface Alarm {
  id: string;
  timestamp: string; // ISO 8601 - when alarm was first triggered
  message: string;
  severity: AlarmSeverity;
  value?: number; // Sensor value that triggered alarm
  acknowledged: boolean;
  acknowledgedAt?: string; // When user clicked acknowledge
  clearedAt?: string; // When alarm condition resolved (sensor_alarm = false)
  isActive: boolean; // Current alarm condition (sensor_alarm = true)
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

/**
 * Determine the current state of an alarm
 */
export function getAlarmState(alarm: Alarm): AlarmState {
  if (alarm.acknowledged && alarm.clearedAt) {
    return 'resolved'; // Both acknowledged and cleared
  }
  if (alarm.acknowledged) {
    return 'acknowledged'; // User acknowledged but still active
  }
  if (alarm.clearedAt || !alarm.isActive) {
    return 'cleared'; // Condition resolved but not acknowledged
  }
  return 'active'; // Active and unacknowledged
}

/**
 * Get display color based on alarm state
 */
export function getAlarmStateColor(state: AlarmState): string {
  switch (state) {
    case 'active':
      return '#dc3545'; // Red - urgent
    case 'cleared':
      return '#ffc107'; // Yellow - needs acknowledgment
    case 'acknowledged':
      return '#6c757d'; // Gray - handled but still present
    case 'resolved':
      return '#28a745'; // Green - fully resolved
  }
}
