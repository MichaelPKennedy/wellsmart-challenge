import { create } from 'zustand';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ConnectionState {
  status: ConnectionStatus;
  isOnline: boolean;
  hasAttemptedConnection: boolean;
  modalDismissed: boolean;
  lastMessageTime: number | null;
  lastErrorTime: number | null;
  lastErrorMessage: string | null;
  reconnectAttempts: number;
  latency: number | null;

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setOnline: (online: boolean) => void;
  setLatency: (latency: number) => void;
  setError: (message: string) => void;
  clearError: () => void;
  recordMessage: () => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setHasAttemptedConnection: (attempted: boolean) => void;
  dismissModal: () => void;
  resetModalDismissal: () => void;

  // Selectors
  isConnected: () => boolean;
  hasError: () => boolean;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: 'connecting',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  hasAttemptedConnection: false,
  modalDismissed: false,
  lastMessageTime: null,
  lastErrorTime: null,
  lastErrorMessage: null,
  reconnectAttempts: 0,
  latency: null,

  setStatus: (status) => set({ status, modalDismissed: false }),

  setOnline: (online) => set({ isOnline: online }),

  setLatency: (latency) => set({ latency }),

  setError: (message) =>
    set({
      status: 'error',
      lastErrorTime: Date.now(),
      lastErrorMessage: message,
      modalDismissed: false,
    }),

  clearError: () =>
    set({
      lastErrorTime: null,
      lastErrorMessage: null,
    }),

  recordMessage: () => set({ lastMessageTime: Date.now() }),

  incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  resetReconnectAttempts: () =>
    set({
      reconnectAttempts: 0,
      lastErrorTime: null,
      lastErrorMessage: null,
    }),

  setHasAttemptedConnection: (attempted) =>
    set({ hasAttemptedConnection: attempted }),

  dismissModal: () => set({ modalDismissed: true }),

  resetModalDismissal: () => set({ modalDismissed: false }),

  isConnected: () => {
    const state = get();
    return state.status === 'connected' && state.isOnline;
  },

  hasError: () => {
    const state = get();
    return state.status === 'error' || state.lastErrorMessage !== null;
  },
}));
