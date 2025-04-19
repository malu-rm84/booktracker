import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/booktracker/',
  server: {
    historyApiFallback: {
      disableDotRule: true, // Adicione esta linha
      rewrites: [
        { from: /\/add-book/, to: '/index.html' } // Especificar a rota
      ]
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
  }
})