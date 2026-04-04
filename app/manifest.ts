import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Plivin.co - Financial Tracker',
        short_name: 'Plivin',
        description: 'Atur keuanganmu makin santuy! Catat pemasukan, pengeluaran, anggaran, dan tabungan impianmu.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
