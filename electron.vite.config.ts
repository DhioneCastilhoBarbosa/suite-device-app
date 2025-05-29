import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
//import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main' // Define a saída do processo principal
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload' // Define a saída do preload
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react()
      // Configuração do plugin de cópia de arquivos
      /*viteStaticCopy({
        targets: [
          {
            src: 'resources/**', // Caminho para os arquivos que você deseja copiar
            dest: 'resources' // Destino dentro do diretório de build
          }
        ]
      })*/
    ],
    build: {
      outDir: 'dist/renderer' // Define a saída do frontend
    }
  }
})
