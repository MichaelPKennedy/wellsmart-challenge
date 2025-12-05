import Dexie, { Table } from 'dexie';
import { ProcessDataPoint } from '@/types/process';
import { Alarm } from '@/types/alarm';

export class ProcessDatabase extends Dexie {
  processData!: Table<ProcessDataPoint>;
  alarms!: Table<Alarm>;

  constructor() {
    super('WellSmartDB');

    this.version(1).stores({
      processData: '&id, timestamp, clientTimestamp',
      alarms: '&id, timestamp, severity, acknowledged',
    });
  }
}

// Create singleton instance
export const db = new ProcessDatabase();

/**
 * Get recent readings from IndexedDB
 * @param limit Maximum number of readings to fetch
 */
export async function getRecentReadings(limit: number = 1000): Promise<ProcessDataPoint[]> {
  try {
    const readings = await db.processData.orderBy('timestamp').reverse().limit(limit).toArray();
    return readings.reverse(); // Reverse back to chronological order
  } catch (err) {
    console.error('Failed to fetch recent readings', err);
    return [];
  }
}

/**
 * Get readings for a specific time range
 */
export async function getReadingsByTimeRange(
  startTime: Date,
  endTime: Date
): Promise<ProcessDataPoint[]> {
  try {
    const startISO = startTime.toISOString();
    const endISO = endTime.toISOString();

    const readings = await db.processData
      .where('timestamp')
      .between(startISO, endISO)
      .toArray();

    return readings;
  } catch (err) {
    console.error('Failed to fetch readings for time range', err);
    return [];
  }
}

/**
 * Clear readings older than specified hours
 * Used for 48-hour circular buffer
 */
export async function clearOldReadings(hoursToKeep: number = 48): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - hoursToKeep * 60 * 60 * 1000).toISOString();
    const deleted = await db.processData.where('timestamp').below(cutoffTime).delete();
    return deleted;
  } catch (err) {
    console.error('Failed to clear old readings', err);
    return 0;
  }
}

/**
 * Get recent alarms
 */
export async function getRecentAlarms(limit: number = 100): Promise<Alarm[]> {
  try {
    const alarms = await db.alarms
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
    return alarms.reverse(); // Reverse back to chronological order
  } catch (err) {
    console.error('Failed to fetch recent alarms', err);
    return [];
  }
}

/**
 * Add alarm to database
 */
export async function addAlarm(alarm: Alarm): Promise<string> {
  try {
    const id = await db.alarms.add(alarm);
    return id as string;
  } catch (err) {
    console.error('Failed to add alarm', err);
    throw err;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const readingCount = await db.processData.count();
    const alarmCount = await db.alarms.count();

    const oldestReading = await db.processData.orderBy('timestamp').first();
    const newestReading = await db.processData.orderBy('timestamp').last();

    return {
      readingCount,
      alarmCount,
      oldestReadingTime: oldestReading?.timestamp,
      newestReadingTime: newestReading?.timestamp,
    };
  } catch (err) {
    console.error('Failed to get database stats', err);
    return null;
  }
}
