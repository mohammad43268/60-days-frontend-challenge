import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Zaforge',
        short_name: 'Zaforge',
        description: 'Zaforge Spatial Canvas',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'application/vnd.zaforge+json': ['.zaforge']
            },
            icons: [
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
            if (id.includes('gsap')) return 'gsap-vendor';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('lucide') || id.includes('zustand')) return 'ui-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
