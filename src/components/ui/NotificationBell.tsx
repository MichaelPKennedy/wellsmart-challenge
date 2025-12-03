'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { AlarmHistoryPanel } from '@/components/alarms/AlarmHistoryPanel';

export function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const unacknowledgedCount = useAlarmStore((state) => state.getUnacknowledgedCount());

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />

        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 z-50">
            <AlarmHistoryPanel />
          </div>
        </>
      )}
    </div>
  );
}
