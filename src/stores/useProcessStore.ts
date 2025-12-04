import { create } from "zustand";
import { ProcessData, ProcessDataPoint } from "@/types/process";

interface ProcessState {
  // Current state
  currentData: ProcessData | null;
  historicalData: ProcessDataPoint[];
  isLoading: boolean;

  // Statistics
  averageFlow: number;
  peakPower: number;
  sessionStartTime: number;

  // Actions
  addDataPoint: (data: ProcessData) => void;
  setCurrentData: (data: ProcessData | null) => void;
  loadHistoricalData: (data: ProcessDataPoint[]) => void;
  clearHistory: () => void;
  setLoading: (isLoading: boolean) => void;

  // Selectors
  getLatestValue: (
    metric: keyof ProcessData
  ) => string | number | boolean | null;
  getAverageValue: (metric: keyof ProcessData) => number;
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  currentData: null,
  historicalData: [],
  isLoading: true,
  averageFlow: 0,
  peakPower: 0,
  sessionStartTime: Date.now(),

  setCurrentData: (data) =>
    set({
      currentData: data,
    }),

  addDataPoint: (data) =>
    set((state) => {
      const dataPoint: ProcessDataPoint = {
        ...data,
        id: crypto.randomUUID(),
        clientTimestamp: performance.now(),
      };

      // Keep last 3600 points in memory (~12 minutes at 200ms = 5Hz)
      const newHistory = [...state.historicalData, dataPoint].slice(-3600);

      // Calculate statistics
      const flowValues = newHistory.map((d) => d.flow_gpm);
      const powerValues = newHistory.map((d) => d.power_kW);

      const averageFlow =
        flowValues.length > 0
          ? flowValues.reduce((a, b) => a + b, 0) / flowValues.length
          : 0;
      const peakPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;

      return {
        currentData: data,
        historicalData: newHistory,
        averageFlow,
        peakPower,
      };
    }),

  loadHistoricalData: (data) =>
    set(() => {
      console.log(`[ProcessStore] Loaded ${data.length} historical data points`);
      const flowValues = data.map((d) => d.flow_gpm);
      const powerValues = data.map((d) => d.power_kW);

      const averageFlow =
        flowValues.length > 0
          ? flowValues.reduce((a, b) => a + b, 0) / flowValues.length
          : 0;
      const peakPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;

      return {
        historicalData: data.slice(-3600),
        averageFlow,
        peakPower,
        isLoading: false,
      };
    }),

  clearHistory: () =>
    set({
      currentData: null,
      historicalData: [],
      averageFlow: 0,
      peakPower: 0,
      sessionStartTime: Date.now(),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  getLatestValue: (metric) => {
    const state = get();
    if (!state.currentData) return null;
    return state.currentData[metric as keyof ProcessData] ?? null;
  },

  getAverageValue: (metric) => {
    const currentState = get();
    const values = currentState.historicalData
      .map((d) => d[metric as keyof ProcessDataPoint])
      .filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  },
}));
