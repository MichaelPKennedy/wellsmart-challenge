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
        // Load recent readings
        const readings = await getRecentReadings(1000);
        if (readings.length > 0) {
          loadHistoricalData(readings);
          console.log(`Loaded ${readings.length} historical readings from IndexedDB`);
        } else {
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
