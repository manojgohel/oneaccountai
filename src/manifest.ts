import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'OneAccount AI',
        short_name: 'OneAccount',
        description: 'Unified AI-powered account management platform. Streamline your digital identity, manage multiple accounts, and enhance productivity with intelligent automation and security features.',
        start_url: '/?utm_source=pwa',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/favicon/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon/android-chrome-256x256.png',
                sizes: '256x256',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon/android-chrome-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon/maskable-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
        categories: ['productivity', 'business', 'utilities'],
        lang: 'en-US',
        scope: '/',
        orientation: 'portrait-primary',
        id: '/oneaccount-ai',
        dir: 'ltr',
        display_override: ['window-controls-overlay', 'standalone'],
        // edge_side_panel: {
        //     preferred_width: 400
        // },
        screenshots: [
            {
                src: '/screenshots/mobile-screenshot-1.png',
                sizes: '640x1136',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Account Management Interface'
            },
            {
                src: '/screenshots/desktop-screenshot-1.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide',
                label: 'AI Dashboard'
            }
        ],
        shortcuts: [
            {
                name: 'AI Assistant',
                short_name: 'AI Assistant',
                description: 'Access AI-powered account management',
                url: '/?utm_source=pwa_shortcut',
                icons: [
                    {
                        src: '/favicon/ai-icon-96x96.png',
                        sizes: '96x96'
                    }
                ]
            }
        ]
    }
}