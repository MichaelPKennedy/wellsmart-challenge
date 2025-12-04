import { create } from 'zustand';
import { Alarm } from '@/types/alarm';

interface AlarmState {
  // All alarms (history)
  allAlarms: Alarm[];

  // Current sensor alarm state
  currentSensorAlarm: boolean;
  currentAlarmId: string | null; // ID of current active sensor alarm

  // Actions
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  acknowledgeAllAlarms: () => void;
  updateAlarmStatus: (sensorAlarm: boolean, value?: number) => void;
  loadAlarmsFromDB: (alarms: Alarm[]) => void;

  // Selectors
  getUnacknowledgedCount: () => number;
  getActiveAlarms: () => Alarm[];
  getRecentAlarms: (limit?: number) => Alarm[];
  getCurrentAlarm: () => Alarm | null;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  allAlarms: [],
  currentSensorAlarm: false,
  currentAlarmId: null,

  addAlarm: (alarmData) => {
    const alarm: Alarm = {
      ...alarmData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      allAlarms: [alarm, ...state.allAlarms],
    }));

    return alarm.id;
  },

  acknowledgeAlarm: (alarmId) => {
    set((state) => ({
      allAlarms: state.allAlarms.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
            }
          : alarm
      ),
    }));
  },

  acknowledgeAllAlarms: () => {
    const now = new Date().toISOString();
    set((state) => ({
      allAlarms: state.allAlarms.map((alarm) =>
        !alarm.acknowledged
          ? {
              ...alarm,
              acknowledged: true,
              acknowledgedAt: now,
            }
          : alarm
      ),
    }));
  },

  updateAlarmStatus: (sensorAlarm, value) => {
    const state = get();

    // Sensor alarm just triggered
    if (sensorAlarm && !state.currentSensorAlarm) {
      const alarmId = get().addAlarm({
        timestamp: new Date().toISOString(),
        message: 'Sensor alarm triggered',
        severity: 'critical',
        value,
        acknowledged: false,
        isActive: true,
      });

      set({
        currentSensorAlarm: true,
        currentAlarmId: alarmId,
      });
    }
    // Sensor alarm cleared
    else if (!sensorAlarm && state.currentSensorAlarm) {
      // Mark current alarm as cleared
      if (state.currentAlarmId) {
        set((state) => ({
          allAlarms: state.allAlarms.map((alarm) =>
            alarm.id === state.currentAlarmId
              ? {
                  ...alarm,
                  isActive: false,
                  clearedAt: new Date().toISOString(),
                }
              : alarm
          ),
          currentSensorAlarm: false,
          currentAlarmId: null,
        }));
      } else {
        set({
          currentSensorAlarm: false,
          currentAlarmId: null,
        });
      }
    }
  },

  loadAlarmsFromDB: (alarms) => {
    set({ allAlarms: alarms });
  },

  getUnacknowledgedCount: () => {
    const state = get();
    return state.allAlarms.filter((alarm) => !alarm.acknowledged).length;
  },

  getActiveAlarms: () => {
    const state = get();
    return state.allAlarms.filter((alarm) => alarm.isActive);
  },

  getRecentAlarms: (limit = 50) => {
    const state = get();
    return state.allAlarms.slice(0, limit);
  },

  getCurrentAlarm: () => {
    const state = get();
    if (state.currentAlarmId) {
      const alarm = state.allAlarms.find((a) => a.id === state.currentAlarmId);
      // Only return if alarm exists and is not acknowledged
      return alarm && !alarm.acknowledged ? alarm : null;
    }
    return null;
  },
}));
