import { create } from "zustand";
import { Alarm } from "@/types/alarm";

interface AlarmState {
  // Alarms
  activeAlarms: Alarm[];
  recentAlarms: Alarm[];
  currentSensorAlarm: boolean;

  // Actions
  addAlarm: (alarm: Alarm) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  clearAlarm: (alarmId: string) => void;
  loadRecentAlarms: (alarms: Alarm[]) => void;
  setSensorAlarm: (active: boolean) => void;

  // Selectors
  getActiveAlarmCount: () => number;
  hasCriticalAlarm: () => boolean;
  getLastAlarm: () => Alarm | null;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  activeAlarms: [],
  recentAlarms: [],
  currentSensorAlarm: false,

  addAlarm: (alarm) =>
    set((state) => {
      // Only track unacknowledged alarms as active
      const newActiveAlarms = alarm.acknowledged
        ? state.activeAlarms
        : [alarm, ...state.activeAlarms];

      // Keep track of recent alarms (last 50)
      const newRecentAlarms = [alarm, ...state.recentAlarms].slice(0, 50);

      return {
        activeAlarms: newActiveAlarms,
        recentAlarms: newRecentAlarms,
      };
    }),

  acknowledgeAlarm: (alarmId) =>
    set((state) => ({
      activeAlarms: state.activeAlarms.filter((alarm) => alarm.id !== alarmId),
      recentAlarms: state.recentAlarms.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
      ),
    })),

  clearAlarm: (alarmId) =>
    set((state) => ({
      activeAlarms: state.activeAlarms.filter((alarm) => alarm.id !== alarmId),
      recentAlarms: state.recentAlarms.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              acknowledged: true,
              resolvedAt: new Date().toISOString(),
            }
          : alarm
      ),
    })),

  loadRecentAlarms: (alarms) =>
    set({
      recentAlarms: alarms,
      activeAlarms: alarms.filter((alarm) => !alarm.acknowledged),
    }),

  setSensorAlarm: (active) => {
    set({ currentSensorAlarm: active });

    // If sensor alarm is triggered, add a new alarm entry
    if (active) {
      const alarm: Alarm = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        message: "Sensor alarm triggered",
        severity: "critical",
        acknowledged: false,
      };

      get().addAlarm(alarm);
    }
  },

  getActiveAlarmCount: () => {
    const state = get();
    return state.activeAlarms.length;
  },

  hasCriticalAlarm: () => {
    const state = get();
    return state.activeAlarms.some((alarm) => alarm.severity === "critical");
  },

  getLastAlarm: () => {
    const state = get();
    return state.recentAlarms.length > 0 ? state.recentAlarms[0] : null;
  },
}));
