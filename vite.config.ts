import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/prototipoSazonDelBarrio.github.io/', // IMPORTANTE: nombre de tu repo
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})