import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    setupFiles: ['./tests/setup.js'],
    environment: 'jsdom',
  },
})
