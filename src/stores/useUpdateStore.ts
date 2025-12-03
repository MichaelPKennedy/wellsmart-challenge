import { create } from 'zustand';

interface UpdateState {
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
  setUpdate: (registration: ServiceWorkerRegistration) => void;
  clearUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  hasUpdate: false,
  registration: null,
  setUpdate: (registration) => set({ hasUpdate: true, registration }),
  clearUpdate: () => set({ hasUpdate: false, registration: null }),
}));
