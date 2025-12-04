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
        <Bell className="w-7 h-7 text-gray-700 dark:text-gray-300" />

        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[24px] h-6 px-2 text-sm font-bold text-white bg-red-600 rounded-full">
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

          {/* Panel - Fixed positioning with viewport padding */}
          <div className="fixed top-16 z-50 left-4 right-4 md:left-auto md:right-6">
            <AlarmHistoryPanel />
          </div>
        </>
      )}
    </div>
  );
}
