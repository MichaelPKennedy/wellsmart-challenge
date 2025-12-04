import { useEffect, useRef } from 'react';
import { Subscription } from 'rxjs';
import { initializeDataStream } from '@/lib/websocket/dataStream.service';
import { useProcessStore } from '@/stores/useProcessStore';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useSamplingRateStore } from '@/stores/useSamplingRateStore';

export function useWebSocket(wsUrl?: string) {
  const subscriptionRef = useRef<Subscription | null>(null);
  const dataStreamRef = useRef<ReturnType<typeof initializeDataStream> | null>(null);
  const addDataPoint = useProcessStore((state) => state.addDataPoint);
  const setStatus = useConnectionStore((state) => state.setStatus);
  const setOnline = useConnectionStore((state) => state.setOnline);
  const recordMessage = useConnectionStore((state) => state.recordMessage);
  const updateAlarmStatus = useAlarmStore((state) => state.updateAlarmStatus);
  const samplingRate = useSamplingRateStore((state) => state.samplingRate);

  useEffect(() => {
    // Get WebSocket URL from prop or environment variable (client-side only)
    const wsUrlToUse = wsUrl || process.env.NEXT_PUBLIC_WS_URL;

    // Only connect if WebSocket URL is configured
    if (!wsUrlToUse) {
      console.log('[WebSocket] No URL configured. Set NEXT_PUBLIC_WS_URL to connect to a WebSocket server.');
      setStatus('disconnected');
      return;
    }

    console.log('[WebSocket] Initializing with URL:', wsUrlToUse);
    setStatus('connecting');

    try {
      // Initialize data stream
      const dataStream = initializeDataStream(wsUrlToUse);
      dataStreamRef.current = dataStream;

      // Subscribe to data stream
      subscriptionRef.current = dataStream.subscribe({
        next: (data) => {
          console.log('[WebSocket] Received data point:', data.timestamp);
          // Update process store
          addDataPoint({
            flow_gpm: data.flow_gpm,
            power_kW: data.power_kW,
            pressure_psi: data.pressure_psi,
            pressure_bar: data.pressure_bar,
            sensor_alarm: data.sensor_alarm,
            timestamp: data.timestamp,
            message_type: 'process_data',
          });

          // Record message time
          recordMessage();

          // Update connection status
          setStatus('connected');
          setOnline(true);

          // Handle sensor alarm (log all alarm events)
          updateAlarmStatus(data.sensor_alarm, data.pressure_psi);
        },
        error: (err) => {
          console.error('[WebSocket] Connection error:', err);
          setStatus('error');
        },
        complete: () => {
          console.log('[WebSocket] Stream completed');
          setStatus('disconnected');
        },
      });
    } catch (err) {
      console.error('[WebSocket] Failed to initialize:', err);
      setStatus('error');
    }

    // Listen to network status
    const handleOnline = () => {
      console.log('Network connection restored');
      setOnline(true);
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [addDataPoint, setStatus, setOnline, recordMessage, updateAlarmStatus, wsUrl]);

  // Update sampling rate when it changes
  useEffect(() => {
    if (dataStreamRef.current) {
      console.log('[WebSocket] Updating sampling rate to:', samplingRate, 'ms');
      dataStreamRef.current.setSamplingRate(samplingRate);
    }
  }, [samplingRate]);
}
