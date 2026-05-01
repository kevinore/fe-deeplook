import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Captures prerendered HTML so we can write the root `dist/index.html` ourselves.
// (Vite/Rolldown's entry-HTML emit conflicts with the prerender plugin's output for `/`.)
const capturedRoutes = {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: ['/', '/precios', '/privacy', '/terms'],
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterTime: 2500,
        timeout: 30000,
        maxConcurrentRoutes: 2,
        injectProperty: '__PRERENDERING__',
        inject: true,
        launchOptions: {
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
      postProcess(route) {
        const canonical = `https://deeplookapp.com${route.route === '/' ? '/' : route.route}`
        route.html = route.html.replace(
          /<link rel="canonical"[^>]*\/?>/i,
          `<link rel="canonical" href="${canonical}" />`
        )
        capturedRoutes[route.route] = route.html
        return route
      },
    }),
    {
      name: 'write-prerendered-index',
      apply: 'build',
      closeBundle() {
        const html = capturedRoutes['/']
        if (!html) return
        const outDir = resolve(process.cwd(), 'dist')
        mkdirSync(outDir, { recursive: true })
        writeFileSync(resolve(outDir, 'index.html'), html, 'utf8')
      },
    },
  ],
  server: {
    historyApiFallback: true,
    allowedHosts: ['deeplookapp.com.ngrok.dev', 'localhost'],
  },
})
