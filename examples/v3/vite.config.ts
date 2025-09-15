import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { twnPlugin } from './vite-plugin-twn'

// https://vite.dev/config/
export default defineConfig({
  plugins: [twnPlugin(), react()],
})
