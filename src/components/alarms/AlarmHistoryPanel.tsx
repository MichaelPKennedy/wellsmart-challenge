'use client';

import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { getAlarmState, getAlarmStateColor } from '@/types/alarm';
import { formatDistanceToNow } from 'date-fns';

export function AlarmHistoryPanel() {
  const recentAlarms = useAlarmStore((state) => state.getRecentAlarms(20));
  const acknowledgeAlarm = useAlarmStore((state) => state.acknowledgeAlarm);
  const unacknowledgedCount = useAlarmStore((state) => state.getUnacknowledgedCount());

  const handleAcknowledge = (alarmId: string) => {
    acknowledgeAlarm(alarmId);
  };

  return (
    <div className="w-96 max-h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Alarms
        </h3>
        {unacknowledgedCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {unacknowledgedCount} unacknowledged
          </p>
        )}
      </div>

      {/* Alarm List */}
      <div className="overflow-y-auto max-h-[500px]">
        {recentAlarms.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No alarms</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentAlarms.map((alarm) => {
              const state = getAlarmState(alarm);
              const stateColor = getAlarmStateColor(state);

              return (
                <div
                  key={alarm.id}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !alarm.acknowledged ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                  }`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: stateColor,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {state === 'active' && (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      {state === 'cleared' && (
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                      {state === 'acknowledged' && (
                        <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                      {state === 'resolved' && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              alarm.acknowledged
                                ? 'text-gray-600 dark:text-gray-400'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {alarm.message}
                          </p>
                          {alarm.value !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                              {alarm.value} PSI
                            </p>
                          )}
                        </div>

                        {/* State Badge */}
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded uppercase flex-shrink-0"
                          style={{
                            backgroundColor: stateColor + '20',
                            color: stateColor,
                          }}
                        >
                          {state}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(alarm.timestamp), {
                          addSuffix: true,
                        })}
                      </p>

                      {/* Acknowledge Button */}
                      {!alarm.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alarm.id)}
                          className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
