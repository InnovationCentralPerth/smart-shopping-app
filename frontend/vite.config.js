import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Bind to all available network interfaces
    port: 5174, // Changed from 5173 to avoid conflict with Open WebUI
    allowedHosts: ['brannigan.taila277ca.ts.net', '100.81.70.37', 'localhost'],
  },
})
