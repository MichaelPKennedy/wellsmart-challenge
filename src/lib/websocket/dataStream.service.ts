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
import { Observable, timer, BehaviorSubject } from "rxjs";
import { ProcessDataPoint } from "@/types/process";
import { db } from "@/lib/storage/db";
import type { SamplingRate } from "@/stores/useSamplingRateStore";

export class DataStreamService {
  private ws$: WebSocketSubject<Record<string, unknown>>;
  public dataStream$: Observable<ProcessDataPoint>;
  private samplingRate$ = new BehaviorSubject<SamplingRate>(100); // Default 100ms

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

    // Main data stream with backpressure handling
    this.dataStream$ = this.ws$.pipe(
      // Validate message type
      filter(
        (data): data is Record<string, unknown> =>
          data && data.message_type === "process_data"
      ),

      // Buffer updates for 100ms to collect rapid messages
      bufferTime(100),
      filter((buffer) => buffer.length > 0),

      // Dynamically throttle based on sampling rate
      throttle(() => timer(this.samplingRate$.value), {
        leading: true,
        trailing: true,
      }),

      // Flatten buffer and extract latest reading
      map((buffer) => {
        // Take the latest message from the buffer
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
          console.error("Failed to persist reading to IndexedDB", err);
        }
      }),

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
      // Note: refCount: false keeps the connection alive even if all subscribers unsubscribe
      // This is necessary for development where React Strict Mode causes double-mounting
      shareReplay({ bufferSize: 1, refCount: false })
    ) as Observable<ProcessDataPoint>;
  }

  /**
   * Update the sampling rate dynamically
   */
  public setSamplingRate(rate: SamplingRate): void {
    this.samplingRate$.next(rate);
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
