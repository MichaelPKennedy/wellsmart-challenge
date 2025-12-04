"use client";

import { WifiOff, ServerOff, X } from "lucide-react";
import { useConnectionStore } from "@/stores/useConnectionStore";

export function OfflineModal() {
  const isOnline = useConnectionStore((state) => state.isOnline);
  const status = useConnectionStore((state) => state.status);
  const hasAttemptedConnection = useConnectionStore(
    (state) => state.hasAttemptedConnection
  );
  const modalDismissed = useConnectionStore((state) => state.modalDismissed);
  const dismissModal = useConnectionStore((state) => state.dismissModal);

  // Show modal only if network/connection issues after attempting connection
  const showOffline = !isOnline && hasAttemptedConnection;
  const showDisconnected =
    isOnline &&
    hasAttemptedConnection &&
    (status === "disconnected" || status === "error");

  if ((!showOffline && !showDisconnected) || modalDismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-lg rounded-2xl border-4 border-red-600 bg-white dark:bg-gray-900 p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={dismissModal}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          {showOffline ? (
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
              <WifiOff className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-6">
              <ServerOff className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
          {showOffline ? "NOW OFFLINE" : "DISCONNECTED FROM SERVER"}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-6">
          {showOffline
            ? "Network connection lost. Check your WiFi or internet connection."
            : "Lost connection to the monitoring server. Attempting to reconnect..."}
        </p>

        {/* Status */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {showOffline ? (
              <>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Offline Mode
                </span>
                <br />
                Historical data available from cache
              </>
            ) : (
              <>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  Reconnecting
                </span>
                <br />
                Real-time updates paused
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
