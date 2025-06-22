export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          mergeRules: true,
          mergeLonghand: true,
          discardDuplicates: true,
          discardEmpty: true,
          minifySelectors: true,
          minifyParams: true,
          normalizeUrl: true,
        }]
      }
    })
  },
} 