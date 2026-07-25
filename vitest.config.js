import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Plugin React aktifkan automatic JSX runtime (konsisten dengan build Vite),
// sehingga komponen tak perlu `import React` saat di-test.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    clearMocks: true,
  },
})
