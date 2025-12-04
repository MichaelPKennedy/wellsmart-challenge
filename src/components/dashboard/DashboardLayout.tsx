"use client";

import React from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { FlowGauge } from "@/components/metrics/FlowGauge";
import { PowerMeter } from "@/components/metrics/PowerMeter";
import { PressureDisplay } from "@/components/metrics/PressureDisplay";
import { AlarmBanner } from "@/components/alarms/AlarmBanner";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { WiFiStatus } from "@/components/ui/WiFiStatus";
import { OfflineModal } from "@/components/ui/OfflineModal";
import { SettingsModal } from "@/components/ui/SettingsModal";

export function DashboardLayout() {
  // Initialize WebSocket and IndexedDB
  useWebSocket();
  useIndexedDB();

  const isConnected = useConnectionStore((state) => state.isConnected());
  const status = useConnectionStore((state) => state.status);

  return (
    <div className="min-h-screen bg-hmi-bg-primary dark:bg-hmi-dark-bg-primary transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-hmi-bg-border dark:border-hmi-dark-bg-border bg-white dark:bg-hmi-dark-bg-secondary shadow-sm transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 md:py-4">
          {/* Header Layout */}
          <div className="flex items-center justify-between">
            {/* Logo/Title - Hidden on Mobile */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-hmi-text-primary dark:text-hmi-dark-text-primary">
                WellSmart HMI
              </h1>
            </div>

            {/* Right Side Controls: WiFi, Status, Notifications, Settings */}
            <div className="flex items-center gap-2 md:gap-6 ml-auto md:ml-0">
              {/* WiFi Status */}
              <WiFiStatus />

              {/* Server Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 md:h-4 md:w-4 rounded-full ${
                    isConnected ? "bg-hmi-status-ok" : "bg-hmi-status-offline"
                  }`}
                />
                <span className="hidden sm:inline text-sm md:text-base font-medium text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
                  {status === "connected" && "Connected"}
                  {status === "connecting" && "Connecting..."}
                  {status === "disconnected" && "Disconnected"}
                  {status === "error" && "Error"}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <NotificationBell />
              <SettingsModal />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <AlarmBanner />

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FlowGauge />
          <PowerMeter />
          <PressureDisplay />
        </div>

        {/* Placeholder for charts and alarms */}
        <div className="mt-8">
          <div className="rounded-lg border border-hmi-bg-border dark:border-hmi-dark-bg-border bg-white dark:bg-hmi-dark-bg-card p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-hmi-text-primary dark:text-hmi-dark-text-primary"></h2>
            <p className="text-sm text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
              Real-time charts, alarm system, and historical data visualization
            </p>
          </div>
        </div>
      </main>
      <OfflineModal />
    </div>
  );
}
