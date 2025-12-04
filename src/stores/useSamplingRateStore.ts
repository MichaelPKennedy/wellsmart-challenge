import { create } from "zustand";

export type SamplingRate = 16 | 50 | 100 | 200; // in milliseconds

interface SamplingRateState {
  samplingRate: SamplingRate;
  setSamplingRate: (rate: SamplingRate) => void;
}

export const useSamplingRateStore = create<SamplingRateState>((set) => ({
  samplingRate: 100, // Default: 100ms
  setSamplingRate: (rate: SamplingRate) => set({ samplingRate: rate }),
}));
