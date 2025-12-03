"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { formatDistanceToNow } from "date-fns";

export function AlarmBanner() {
  const currentAlarm = useAlarmStore((state) => state.getCurrentAlarm());
  const acknowledgeAlarm = useAlarmStore((state) => state.acknowledgeAlarm);
  const [dismissed, setDismissed] = useState(false);
  const [lastAlarmId, setLastAlarmId] = useState<string | null>(null);

  useEffect(() => {
    if (currentAlarm && currentAlarm.id !== lastAlarmId) {
      console.log("[AlarmBanner] New alarm detected:", {
        newId: currentAlarm.id,
        lastId: lastAlarmId,
        acknowledged: currentAlarm.acknowledged,
        isActive: currentAlarm.isActive,
      });
      setDismissed(false);
      setLastAlarmId(currentAlarm.id);
    }
  }, [currentAlarm, lastAlarmId]);

  // Show banner if there's an active alarm that hasn't been acknowledged or dismissed
  if (!currentAlarm || currentAlarm.acknowledged || dismissed) return null;

  const handleAcknowledge = () => {
    acknowledgeAlarm(currentAlarm.id);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="mb-6 animate-pulse rounded-lg border-2 border-hmi-status-error bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-6 py-4 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <AlertTriangle className="h-6 w-6 text-hmi-status-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-hmi-status-error">
                SENSOR ALARM ACTIVE
              </h3>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatDistanceToNow(new Date(currentAlarm.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-hmi-text-secondary dark:text-gray-300 mt-1">
              Critical sensor condition detected
              {currentAlarm.value && ` - ${currentAlarm.value} PSI`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAcknowledge}
            className="rounded bg-hmi-status-error px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
          >
            ACKNOWLEDGE
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
