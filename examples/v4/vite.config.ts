import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { twnPlugin } from 'tailwind-nested/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [twnPlugin(), react(), tailwindcss()],
})

