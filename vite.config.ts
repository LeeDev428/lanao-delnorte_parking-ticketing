import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['assets/img/dakiri-favicon.png', 'assets/img/dakiri-logo.png', 'robots.txt'],
            manifest: {
                name: 'Lanao del Norte Parking Ticketing',
                short_name: 'Parking App',
                description: 'Parking ticket management and payment system',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/assets/img/dakiri-favicon.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/assets/img/dakiri-favicon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/tacats\.live\/plates\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'plates-images-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                            }
                        }
                    }
                ]
            }
        })
    ],
    server: {
        host: 'localhost', // Use localhost for development
        port: 5173,
        strictPort: true,
        cors: {
            origin: '*', // Allow all origins for development
            credentials: true,
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
