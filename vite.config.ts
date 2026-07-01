import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: 'lucide-react', replacement: path.resolve(__dirname, './src/lib/icons.tsx') },
      { find: /^zustand$/, replacement: path.resolve(__dirname, './node_modules/zustand/index.js') },
      { find: 'zustand/vanilla', replacement: path.resolve(__dirname, './node_modules/zustand/vanilla.js') },
      { find: 'zustand/react', replacement: path.resolve(__dirname, './node_modules/zustand/react.js') },
      { find: 'zustand/middleware', replacement: path.resolve(__dirname, './node_modules/zustand/middleware.js') },
      { find: 'zustand/traditional', replacement: path.resolve(__dirname, './node_modules/zustand/traditional.js') },
      { find: 'zustand/shallow', replacement: path.resolve(__dirname, './node_modules/zustand/shallow.js') },
      { find: 'tailwind-merge', replacement: path.resolve(__dirname, './node_modules/tailwind-merge/dist/bundle-cjs.js') },
    ],
  },
})
