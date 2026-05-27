import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/PortifolioInterativo/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (normalizedId.includes('/node_modules/three/')) return 'three-core'
          if (normalizedId.includes('/node_modules/@react-three/drei/')) return 'drei'
          if (normalizedId.includes('/node_modules/@react-three/fiber/')) return 'fiber'
          if (normalizedId.includes('/node_modules/react')) return 'react-vendor'

          return undefined
        },
      },
    },
  },
})
