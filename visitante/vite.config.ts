import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Kibô-no-Iê Visitante',
        short_name: 'Visitante',
        description: 'Guia de bolso e cardápio digital oficial para o público',
        theme_color: '#f5f8f2',
        background_color: '#f5f8f2',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.jpg',
            sizes: '1024x1024',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
})
