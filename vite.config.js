// vite.config.js
import path from 'path'
import { defineConfig, normalizePath } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { watchAndRun } from 'vite-plugin-watch-and-run'
import svg from '@poppanator/sveltekit-svg'




export default defineConfig({
  build: {
    outDir: './build',
  },
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  plugins: [
    watchAndRun([
      {
        name: 'build database',
        watchKind: ['add', 'change', 'unlink'],
        watch: normalizePath(path.resolve('data/**/*.(yaml|md)')),
        run: 'npm run build-db',
        delay: 300
      }
    ]),
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './data/3Dmodels/cars') + '/*'),
          dest: './3dmodels'
        },
        {
          src: normalizePath(path.resolve(__dirname, './data/3Dmodels/wheels') + '/*'),
          dest: './3dmodels'
        },
        {
          src: normalizePath(path.resolve(__dirname, './data/2Dassets/') + '/*'),
          dest: './2dassets'
        },
        {
          src: normalizePath(path.resolve(__dirname, './data/2Dassets/') + '/background/*'),
          dest: './2dassets/background'
        },
      ]
    }),
    svg()

  ]
});