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
        // Load recent readings (3600 points = ~12 minutes at 200ms = 5Hz)
        const readings = await getRecentReadings(3600);
        if (readings.length > 0) {
          loadHistoricalData(readings);
        } else {
          setLoading(false);
        }

        // Load recent alarms
        const alarms = await getRecentAlarms(50);
        loadAlarmsFromDB(alarms);
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
        await clearOldReadings(48);
      } catch (err) {
        console.error('Failed to cleanup old readings', err);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(cleanupInterval);
  }, []);
}
