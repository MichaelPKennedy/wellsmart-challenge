import { useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { initializeDataStream } from "@/lib/websocket/dataStream.service";
import { useProcessStore } from "@/stores/useProcessStore";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { useAlarmStore } from "@/stores/useAlarmStore";

export function useWebSocket(wsUrl?: string) {
  const uiSubscriptionRef = useRef<Subscription | null>(null);
  const storageSubscriptionRef = useRef<Subscription | null>(null);
  const setCurrentData = useProcessStore((state) => state.setCurrentData);
  const addDataPoint = useProcessStore((state) => state.addDataPoint);
  const setStatus = useConnectionStore((state) => state.setStatus);
  const setOnline = useConnectionStore((state) => state.setOnline);
  const setHasAttemptedConnection = useConnectionStore(
    (state) => state.setHasAttemptedConnection
  );
  const recordMessage = useConnectionStore((state) => state.recordMessage);
  const updateAlarmStatus = useAlarmStore((state) => state.updateAlarmStatus);

  useEffect(() => {
    // Get WebSocket URL from prop or environment variable (client-side only)
    const wsUrlToUse = wsUrl || process.env.NEXT_PUBLIC_WS_URL;

    // Only connect if WebSocket URL is configured
    if (!wsUrlToUse) {
      setStatus("disconnected");
      return;
    }

    setHasAttemptedConnection(true);
    setStatus("connecting");

    try {
      // Initialize data stream
      const dataStream = initializeDataStream(wsUrlToUse);

      // Subscribe to UI stream (100ms) - updates gauges only
      uiSubscriptionRef.current = dataStream.dataStream$.subscribe({
        next: (data) => {
          // Update current data for gauges
          setCurrentData({
            flow_gpm: data.flow_gpm,
            power_kW: data.power_kW,
            pressure_psi: data.pressure_psi,
            pressure_bar: data.pressure_bar,
            sensor_alarm: data.sensor_alarm,
            timestamp: data.timestamp,
            message_type: "process_data",
          });

          // Record message time
          recordMessage();

          // Update connection status
          setStatus("connected");
          setOnline(true);

          // Handle sensor alarm (log all alarm events)
          updateAlarmStatus(data.sensor_alarm, data.pressure_psi);
        },
        error: (err) => {
          console.error("[WebSocket] UI stream error:", err);
          setStatus("error");
        },
        complete: () => {
          setStatus("disconnected");
        },
      });

      // Subscribe to storage stream (500ms) - updates historical data for charts
      storageSubscriptionRef.current = dataStream.storageStream$.subscribe({
        next: (data) => {
          // Update historical data for charts
          addDataPoint({
            flow_gpm: data.flow_gpm,
            power_kW: data.power_kW,
            pressure_psi: data.pressure_psi,
            pressure_bar: data.pressure_bar,
            sensor_alarm: data.sensor_alarm,
            timestamp: data.timestamp,
            message_type: "process_data",
          });
        },
        error: (err) => {
          console.error("[WebSocket] Storage stream error:", err);
        },
      });
    } catch (err) {
      console.error("[WebSocket] Failed to initialize:", err);
      setStatus("error");
    }

    // Listen to network status
    const handleOnline = () => {
      setOnline(true);
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (uiSubscriptionRef.current) {
        uiSubscriptionRef.current.unsubscribe();
      }
      if (storageSubscriptionRef.current) {
        storageSubscriptionRef.current.unsubscribe();
      }
    };
  }, [
    setCurrentData,
    addDataPoint,
    setStatus,
    setOnline,
    setHasAttemptedConnection,
    recordMessage,
    updateAlarmStatus,
    wsUrl,
  ]);
}
