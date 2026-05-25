import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            base: '/remamusic/',
            scope: '/remamusic/',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /\/api\/publico\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-publica',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Cancionero Católico',
                short_name: 'Cancionero',
                description: 'Cancionero para músicos católicos',
                theme_color: '#1976d2',
                background_color: '#121212',
                display: 'standalone',
                scope: '/remamusic/',
                start_url: '/remamusic/',
                icons: [
                    { src: '/remamusic/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/remamusic/icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
        }),
    ],
    base: '/remamusic/',
});