module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,css,html,webmanifest,png,svg}'],
  swDest: 'dist/sw.js',
  navigateFallback: '/offline.html',
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v1',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/search'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'search-v1'
      }
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/meta'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'metadata-v1',
        networkTimeoutSeconds: 3
      }
    }
  ]
};
