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
        name: 'Zaforge OS',
        short_name: 'Zaforge',
        description: 'Zaforge Desktop Application',
        theme_color: '#FAFAFA',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: '/zaforge-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
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
                src: '/zaforge-icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          }
        ]
      }
    })
  ],
})
