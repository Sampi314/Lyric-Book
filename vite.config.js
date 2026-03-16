import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Lyric-Book/',
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
