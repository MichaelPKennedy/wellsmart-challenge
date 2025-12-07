import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import {
  bufferTime,
  filter,
  throttle,
  retry,
  repeat,
  tap,
  scan,
  shareReplay,
  catchError,
  map,
} from "rxjs/operators";
import { Observable, timer, Subject } from "rxjs";
import { ProcessDataPoint } from "@/types/process";
import { db } from "@/lib/storage/db";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

/**
 * Calculate exponential backoff delay for reconnection attempts
 * @param attemptCount - The number of reconnection attempts (0-indexed)
 * @returns Observable timer for the delay
 */
function getReconnectDelay(attemptCount: number) {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
  return timer(delay);
}

export class DataStreamService {
  private ws$: WebSocketSubject<Record<string, unknown>>;
  public dataStream$: Observable<ProcessDataPoint>;
  public storageStream$: Observable<ProcessDataPoint>;
  public connectionStatus$: Observable<ConnectionStatus>;
  private connectionStatusSubject: Subject<ConnectionStatus>;

  constructor(wsUrl: string) {
    // Initialize connection status subject
    this.connectionStatusSubject = new Subject<ConnectionStatus>();
    this.connectionStatus$ = this.connectionStatusSubject.asObservable();

    this.ws$ = webSocket({
      url: wsUrl,
      deserializer: (e: MessageEvent) => {
        try {
          return JSON.parse(e.data) as Record<string, unknown>;
        } catch (err) {
          console.error("Failed to parse WebSocket message", e.data);
          throw err;
        }
      },
      serializer: (value: unknown) => JSON.stringify(value),
      openObserver: {
        next: () => {
          // Emit connected status
          this.connectionStatusSubject.next("connected");
        },
      },
      closeObserver: {
        next: () => {
          console.warn("WebSocket closed");

          // Emit reconnecting status
          this.connectionStatusSubject.next("reconnecting");
        },
      },
    });

    // Base stream: common processing before throttling
    const baseStream$ = this.ws$.pipe(
      // Validate message type
      filter(
        (data): data is Record<string, unknown> =>
          data && data.message_type === "process_data"
      ),

      // Buffer updates for 50ms to collect rapid messages
      bufferTime(50),
      filter((buffer) => buffer.length > 0),

      // Handle errors (unexpected disconnects) with exponential backoff
      retry({
        count: Number.POSITIVE_INFINITY,
        delay: (error, retryCount) => getReconnectDelay(retryCount),
      }),

      // Handle completions (normal disconnects) with exponential backoff
      repeat({
        count: Number.POSITIVE_INFINITY,
        delay: (repeatCount) => getReconnectDelay(repeatCount),
      }),

      catchError((err: Error) => {
        console.error("WebSocket error:", err);
        throw err;
      }),

      // Share single subscription among multiple subscribers
      shareReplay({ bufferSize: 1, refCount: false })
    );

    // UI Stream: 100ms throttling for smooth gauge updates
    this.dataStream$ = baseStream$.pipe(
      // Throttle at 100ms for real-time UI
      throttle(() => timer(100), {
        leading: true,
        trailing: true,
      }),

      // Flatten buffer and extract latest reading
      map((buffer) => {
        const latest = buffer[buffer.length - 1] as Record<string, unknown>;
        return {
          flow_gpm: latest.flow_gpm as number,
          power_kW: latest.power_kW as number,
          pressure_psi: latest.pressure_psi as number,
          pressure_bar: latest.pressure_bar as number,
          sensor_alarm: latest.sensor_alarm as boolean,
          timestamp: latest.timestamp as string,
          message_type: "process_data" as const,
          id: crypto.randomUUID(),
          clientTimestamp: performance.now(),
        } as ProcessDataPoint;
      }),

      // Remove duplicates if same timestamp
      scan((acc: ProcessDataPoint | null, current: ProcessDataPoint) => {
        if (acc && acc.timestamp === current.timestamp) {
          return acc;
        }
        return current;
      }, null as ProcessDataPoint | null),
      filter((data): data is ProcessDataPoint => data !== null),

      shareReplay({ bufferSize: 1, refCount: false })
    ) as Observable<ProcessDataPoint>;

    // Storage Stream: 200ms throttling for IndexedDB and charts
    this.storageStream$ = baseStream$.pipe(
      throttle(() => timer(200), {
        leading: true,
        trailing: true,
      }),

      // Flatten buffer and extract latest reading
      map((buffer) => {
        const latest = buffer[buffer.length - 1] as Record<string, unknown>;
        return {
          flow_gpm: latest.flow_gpm as number,
          power_kW: latest.power_kW as number,
          pressure_psi: latest.pressure_psi as number,
          pressure_bar: latest.pressure_bar as number,
          sensor_alarm: latest.sensor_alarm as boolean,
          timestamp: latest.timestamp as string,
          message_type: "process_data" as const,
          id: crypto.randomUUID(),
          clientTimestamp: performance.now(),
        } as ProcessDataPoint;
      }),

      // Remove duplicates if same timestamp
      scan((acc: ProcessDataPoint | null, current: ProcessDataPoint) => {
        if (acc && acc.timestamp === current.timestamp) {
          return acc;
        }
        return current;
      }, null as ProcessDataPoint | null),
      filter((data): data is ProcessDataPoint => data !== null),

      // Persist to IndexedDB
      tap(async (reading) => {
        try {
          await db.processData.add(reading);
        } catch (err) {
          // Silently ignore duplicate key errors (if timestamp already exists)
          if (err instanceof Error && err.name?.includes("ConstraintError")) {
            return;
          }
          console.error("Failed to persist reading to IndexedDB", err);
        }
      }),

      shareReplay({ bufferSize: 1, refCount: false })
    ) as Observable<ProcessDataPoint>;
  }

  /**
   * Subscribe to the data stream
   * Returns subscription that can be unsubscribed
   */
  public subscribe(observer: {
    next: (data: ProcessDataPoint) => void;
    error?: (err: Error) => void;
    complete?: () => void;
  }) {
    return this.dataStream$.subscribe(observer);
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect() {
    if (this.ws$) {
      this.ws$.complete();
    }
  }
}

// Singleton instance
let dataStreamInstance: DataStreamService | null = null;

export function initializeDataStream(wsUrl: string): DataStreamService {
  if (!dataStreamInstance) {
    dataStreamInstance = new DataStreamService(wsUrl);
  }
  return dataStreamInstance;
}

export function getDataStream(): DataStreamService {
  if (!dataStreamInstance) {
    throw new Error(
      "DataStreamService not initialized. Call initializeDataStream first."
    );
  }
  return dataStreamInstance;
}
