import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'

export default defineConfig({
  test: {
    projects: [
      {
        // React component tests — run in a real browser
        plugins: [tsconfigPaths(), react()],
        resolve: {
          alias: {
            'next/image': path.resolve('./app/__mocks__/next-image.tsx'),
            'next/link': path.resolve('./app/__mocks__/next-link.tsx'),
          },
        },
        test: {
          name: 'browser',
          include: ['**/*.test.tsx'],
          setupFiles: ['./vitest.setup.browser.ts'],
          browser: {
            provider: playwright(),
            headless: true,
            enabled: true,
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
      {
        // Server-side tests (API routes, data functions) — run in Node
        plugins: [tsconfigPaths()],
        test: {
          name: 'node',
          include: ['app/api/**/*.test.ts', 'lib/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['./vitest.setup.node.ts'],
        },
      },
    ],
  },
})
