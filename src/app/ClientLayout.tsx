"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useThemeStore } from "@/stores/useThemeStore";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UpdateNotification } from "@/components/ui/UpdateNotification";

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  // Register Service Worker
  useServiceWorker();

  const { theme } = useTheme();
  const setDarkMode = useThemeStore((state) => state.setDarkMode);

  // Sync next-themes with Zustand store
  useEffect(() => {
    const isDark = theme === "dark";
    setDarkMode(isDark);
  }, [theme, setDarkMode]);

  return (
    <>
      {children}
      <UpdateNotification />
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </ThemeProvider>
  );
}
