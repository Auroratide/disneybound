import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      'next/image': path.resolve('./app/__mocks__/next-image.tsx'),
      'next/link': path.resolve('./app/__mocks__/next-link.tsx'),
    },
  },
  test: {
    browser: {
      provider: playwright(),
      headless: true,
      enabled: true,
      instances: [
        { browser: 'chromium' },
      ],
    },
  }
})
