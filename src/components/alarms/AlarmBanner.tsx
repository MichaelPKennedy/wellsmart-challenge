'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useProcessStore } from '@/stores/useProcessStore';

export function AlarmBanner() {
  const sensorAlarm = useProcessStore((state) => state.currentData?.sensor_alarm);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!sensorAlarm || acknowledged) return null;

  return (
    <div className="mb-6 animate-pulse rounded-lg border-2 border-hmi-status-error bg-red-50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-6 w-6 text-hmi-status-error" />
          <div>
            <h3 className="font-bold text-hmi-status-error">SENSOR ALARM ACTIVE</h3>
            <p className="text-sm text-hmi-text-secondary">Critical sensor condition detected</p>
          </div>
        </div>

        <button
          onClick={() => setAcknowledged(true)}
          className="rounded bg-hmi-status-error px-4 py-2 font-semibold text-white hover:bg-red-600"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}
