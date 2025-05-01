"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("192.168.");

    if ("serviceWorker" in navigator) {
      if (isDevelopment) {
        // unregister all service workers in development
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            for (const registration of registrations) {
              registration.unregister();
              console.log("unregister service worker in development");
            }
            // clear cache
            caches
              .keys()
              .then((cacheNames) => {
                return Promise.all(
                  cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                  })
                );
              })
              .then(() => {
                console.log("service worker cache cleared");
                // prompt user to refresh page to completely remove service worker
                if (
                  window.confirm(
                    "service worker is disabled. to completely remove the cache, please refresh the page. refresh now?"
                  )
                ) {
                  window.location.reload();
                }
              });
          }
        });
      } else {
        // 只在生产环境中注册 Service Worker
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service worker registration failed:", err);
        });
      }
    }
  }, []);

  return null;
}
