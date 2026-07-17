import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const isProd = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig({
  base: isProd ? '/legal-insure-app/' : '/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
