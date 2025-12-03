"use client";

import { useEffect } from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useThemeStore } from "@/stores/useThemeStore";
import { UpdateNotification } from "@/components/ui/UpdateNotification";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Register Service Worker
  useServiceWorker();

  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      {children}
      <UpdateNotification />
    </>
  );
}
