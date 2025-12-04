import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import {
  bufferTime,
  filter,
  throttle,
  retry,
  tap,
  scan,
  shareReplay,
  catchError,
  map,
} from "rxjs/operators";
import { Observable, timer } from "rxjs";
import { ProcessDataPoint } from "@/types/process";
import { db } from "@/lib/storage/db";

export class DataStreamService {
  private ws$: WebSocketSubject<Record<string, unknown>>;
  public dataStream$: Observable<ProcessDataPoint>;
  public storageStream$: Observable<ProcessDataPoint>;
  private storageSubscription: any = null;

  constructor(wsUrl: string) {
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
      closeObserver: {
        next: () => {
          console.warn("WebSocket closed");
        },
      },
      openObserver: {
        next: () => {
          console.log("WebSocket connected");
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

      // Handle reconnection with exponential backoff
      retry({
        count: Number.POSITIVE_INFINITY,
        delay: (error, retryCount) => {
          const baseDelay = 1000; // 1 second
          const maxDelay = 30000; // 30 seconds
          const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
          console.log(`Reconnecting in ${delay}ms (attempt ${retryCount + 1})`);
          return timer(delay);
        },
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
          console.log("[Storage] Saved reading to IndexedDB at 200ms interval");
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

    // Auto-subscribe to storage stream to ensure writes happen
    this.storageSubscription = this.storageStream$.subscribe({
      next: () => {
        // Data is written via tap operator above
      },
      error: (err) => {
        console.error("[Storage] Storage stream error:", err);
      },
    });
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
