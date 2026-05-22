import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "HimalTrails",
        short_name: "HimalTrails",
        description: "Honest Nepal trekking data for independent trekkers",
        theme_color: "#1A3A2A",
        background_color: "#F7F5F0",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/trails/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "trails-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "trail-images",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "weather-api",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 30 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
});
