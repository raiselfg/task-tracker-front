import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { z } from 'zod';

export default defineConfig(({ mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (
    !isPreview &&
    !z.url({ protocol: /^https?$/ }).safeParse(env.VITE_API_URL).success
  ) {
    throw new Error(
      'Укажите VITE_API_URL в .env.local или окружении сборки: полный HTTP(S) URL API, например https://api.example.com/api/v1.',
    );
  }

  return {
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          id: '/',
          name: 'Рядом — личные и семейные задачи',
          short_name: 'Рядом',
          description: 'Личные дела и общие планы в одном месте.',
          lang: 'ru',
          start_url: '/tasks',
          scope: '/',
          display: 'standalone',
          theme_color: '#171717',
          background_color: '#ffffff',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
          cleanupOutdatedCaches: true,
          skipWaiting: false,
          clientsClaim: true,
        },
      }),
    ],
    server: { port: 3000, strictPort: true },
  };
});
