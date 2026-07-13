import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi Vite.
// base: './' penting agar file JS/CSS dimuat dengan path relatif
// saat dijalankan di dalam APK Android (WebView Capacitor).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
})
