import { useEffect } from 'react';
import { useProcessStore } from '@/stores/useProcessStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { getRecentReadings, getRecentAlarms, clearOldReadings } from '@/lib/storage/db';

/**
 * Hook to load historical data from IndexedDB on mount
 * and setup periodic cleanup of old data
 */
export function useIndexedDB() {
  const loadHistoricalData = useProcessStore((state) => state.loadHistoricalData);
  const setLoading = useProcessStore((state) => state.setLoading);
  const loadAlarmsFromDB = useAlarmStore((state) => state.loadAlarmsFromDB);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recent readings (2400 points = ~20 minutes at 500ms = 2Hz)
        const readings = await getRecentReadings(2400);
        console.log(`[IndexedDB] Found ${readings.length} readings in database`);
        if (readings.length > 0) {
          // Log timestamp range
          const timestamps = readings.map(r => new Date(r.timestamp).getTime());
          const oldest = Math.min(...timestamps);
          const newest = Math.max(...timestamps);
          console.log(`[IndexedDB] Date range: ${new Date(oldest).toISOString()} to ${new Date(newest).toISOString()}`);

          loadHistoricalData(readings);
        } else {
          console.log(`[IndexedDB] No historical data found, starting fresh`);
          setLoading(false);
        }

        // Load recent alarms
        const alarms = await getRecentAlarms(50);
        loadAlarmsFromDB(alarms);
        console.log(`Loaded ${alarms.length} recent alarms from IndexedDB`);
      } catch (err) {
        console.error('Failed to load data from IndexedDB', err);
        setLoading(false);
      }
    };

    loadData();
  }, [loadHistoricalData, setLoading, loadAlarmsFromDB]);

  // Setup periodic cleanup of old data (every 15 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        const deleted = await clearOldReadings(48);
        if (deleted > 0) {
          console.log(`Cleanup: Removed ${deleted} old readings`);
        }
      } catch (err) {
        console.error('Failed to cleanup old readings', err);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(cleanupInterval);
  }, []);
}
