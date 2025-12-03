'use client';

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useUpdateStore } from '@/stores/useUpdateStore';

export function UpdateNotification() {
  const hasUpdate = useUpdateStore((state) => state.hasUpdate);
  const registration = useUpdateStore((state) => state.registration);
  const clearUpdate = useUpdateStore((state) => state.clearUpdate);
  const [dismissed, setDismissed] = useState(false);

  const handleUpdate = async () => {
    if (!registration?.waiting) return;

    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page once new worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    clearUpdate();
  };

  if (!hasUpdate || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-4">
      <div className="rounded-lg border border-blue-200 bg-white dark:bg-gray-800 dark:border-blue-800 shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Update Available
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            A new version of the dashboard is ready to install.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
