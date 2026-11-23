import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '.env') })

/** Bake TELEMETRY_* at build time (packaged app has no .env). Empty → defaults JSON. */
function telemetryDefine(): Record<string, string> {
  const keys = [
    'TELEMETRY_ENABLED',
    'TELEMETRY_URL',
    'TELEMETRY_TOKEN',
    'TELEMETRY_APPLICATION'
  ] as const
  const define: Record<string, string> = {}
  for (const key of keys) {
    define[`process.env.${key}`] = JSON.stringify(process.env[key] ?? '')
  }
  return define
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: telemetryDefine(),
    build: {
      outDir: 'dist/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      outDir: 'dist/renderer'
    }
  }
})
