import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['zaforge-icon.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Zaforge',
        short_name: 'Zaforge',
        description: 'Zaforge Spatial Canvas',
        theme_color: '#FAFAFA',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192 512x512',
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
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        ]
      }
    })
  ],
})
