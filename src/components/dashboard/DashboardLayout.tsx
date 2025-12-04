"use client";

import React from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { FlowGauge } from "@/components/metrics/FlowGauge";
import { PowerMeter } from "@/components/metrics/PowerMeter";
import { PressureDisplay } from "@/components/metrics/PressureDisplay";
import { AlarmBanner } from "@/components/alarms/AlarmBanner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { WiFiStatus } from "@/components/ui/WiFiStatus";
import { OfflineModal } from "@/components/ui/OfflineModal";
import { SamplingRateDropdown } from "@/components/ui/SamplingRateDropdown";

export function DashboardLayout() {
  // Initialize WebSocket and IndexedDB
  useWebSocket();
  useIndexedDB();

  const isConnected = useConnectionStore((state) => state.isConnected());
  const status = useConnectionStore((state) => state.status);

  return (
    <div className="min-h-screen bg-hmi-bg-primary dark:bg-hmi-dark-bg-primary transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-hmi-bg-border dark:border-hmi-dark-bg-border bg-white dark:bg-hmi-dark-bg-secondary shadow-sm transition-colors duration-200">
        {/* Desktop Header */}
        <div className="hidden md:flex mx-auto max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-hmi-text-primary dark:text-hmi-dark-text-primary">
              WellSmart HMI Dashboard
            </h1>
            <p className="text-sm text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
              Real-time process monitoring
            </p>
          </div>

          {/* Sampling Rate, WiFi Status, Server Connection, Notifications, and Theme Toggle */}
          <div className="flex items-center gap-6">
            {/* Sampling Rate Dropdown */}
            <SamplingRateDropdown />

            {/* WiFi Status */}
            <WiFiStatus />

            {/* Server Connection Status */}
            <div className="flex items-center gap-3">
              <div
                className={`h-4 w-4 rounded-full ${
                  isConnected ? "bg-hmi-status-ok" : "bg-hmi-status-offline"
                }`}
              />
              <span className="text-base font-medium text-hmi-text-secondary dark:text-hmi-dark-text-secondary">
                {status === "connected" && "Server Connected"}
                {status === "connecting" && "Connecting..."}
                {status === "disconnected" && "Server Disconnected"}
                {status === "error" && "Connection Error"}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-hmi-text-primary dark:text-hmi-dark-text-primary">
              WellSmart
            </h1>
            <div className="flex items-center gap-2">
              <WiFiStatus />
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`h-3 w-3 rounded-full flex-shrink-0 ${
                  isConnected ? "bg-hmi-status-ok" : "bg-hmi-status-offline"
                }`}
              />
              <span className="text-xs font-medium text-hmi-text-secondary dark:text-hmi-dark-text-secondary truncate">
                {status === "connected" && "Connected"}
                {status === "connecting" && "Connecting..."}
                {status === "disconnected" && "Disconnected"}
                {status === "error" && "Error"}
              </span>
            </div>
            <SamplingRateDropdown />
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
