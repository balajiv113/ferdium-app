import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-electron-plugin'
import { customStart, alias } from 'vite-electron-plugin/plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import renderer from 'vite-plugin-electron-renderer'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

// rmSync(path.join(__dirname, 'build'), { recursive: true, force: true })

const plugins = [alias([{
  find: '@common',
  replacement: path.join(__dirname, 'src/common')
}, {
  find: '@base',
  replacement: path.join(__dirname, 'src/base')
}, {
  find: '@renderer',
  replacement: path.join(__dirname, 'src/renderer')
}])];

export default defineConfig({
  mode: 'development',
  build: {
    minify: false,
    outDir: 'build/src/base',
    commonjsOptions: {

    }
  },
  resolve: {
    alias: {
      '@common': path.join(__dirname, 'src/common'),
      '@renderer': path.join(__dirname, 'src/renderer'),
      '@base': path.join(__dirname, 'src/base'),
    },
  },
  plugins: [
    react({
      babel: {
        compact: false,
        minified: false,
        parserOpts: {
          plugins: ['decorators-legacy'],
        }
      }
    }),
    electron({
      outDir: 'build',
      include: [
        'src/base',
        'src/common',
      ],

      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,

      },
      // Will start Electron via VSCode Debug
      plugins: process.env.VSCODE_DEBUG
        ? [customStart(debounce(() => console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App'))),
          ...plugins]
        : plugins,
    }),
    viteStaticCopy({
      watch: {
        reloadPageOnChange: true
      },
      targets: [{
        src: './package.json',
        dest: '.'
      }, {
        src: './recipes/archives/*.tar.gz',
        dest: '../recipes'
      }, {
        src: './recipes/all.json',
        dest: '../recipes'
      }, {
        src: './src/renderer/i18n/locales/*.json',
        dest: './assets/locales'
      }, {
        src: './src/base/internal-server/package.json',
        dest: './internal-server'
      }, {
        src: './src/base/internal-server/env.ini',
        dest: './internal-server'
      }, {
        src: './src/base/internal-server/ace',
        dest: './internal-server'
      }]
    }),
    renderer({
      nodeIntegration: true,
    }),
  ],
  server: process.env.VSCODE_DEBUG ? (() => {
    const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
    return {
      host: url.hostname,
      port: +url.port,
    }
  })() : undefined,
  clearScreen: false
})

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout
  return ((...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }) as Fn
}
