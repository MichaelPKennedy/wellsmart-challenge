"use client";

import { useEffect } from "react";

export function useServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported in this browser");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none", // Always check for updates
        });

        console.log("[App] Service Worker registered:", registration);

        // Check for updates periodically
        const checkForUpdates = setInterval(async () => {
          try {
            await registration.update();
          } catch (err) {
            console.warn(
              "[App] Failed to check for Service Worker updates:",
              err
            );
          }
        }, 60000); // Every 60 seconds

        // Listen for new service worker waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log(
                  "[App] New Service Worker available, ready to activate"
                );
                // TODO: Show update notification
                // dispatch an action to show "Update available" banner
              }
            });
          }
        });

        return () => {
          clearInterval(checkForUpdates);
        };
      } catch (err) {
        console.error("[App] Service Worker registration failed:", err);
      }
    };

    registerServiceWorker();
  }, []);
}

/**
 * Prompts user to install update if available
 * Call this after user clicks "Install Update" button
 */
export async function activateNewServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload page once new worker is active
    let newWorkerActive = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!newWorkerActive) {
        newWorkerActive = true;
        window.location.reload();
      }
    });
  }
}
