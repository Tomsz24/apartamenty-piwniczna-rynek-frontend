
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ical': {
        target: 'https://ical.booking.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ical/, ''),
        secure: true,
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})
