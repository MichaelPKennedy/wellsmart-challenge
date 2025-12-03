'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useConnectionStore } from '@/stores/useConnectionStore';

export function WiFiStatus() {
  const isOnline = useConnectionStore((state) => state.isOnline);

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">
            Online
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          <span className="text-base font-medium text-red-600 dark:text-red-400">
            Offline
          </span>
        </>
      )}
    </div>
  );
}
