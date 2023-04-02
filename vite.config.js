// vite.config.js
import path from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import sveltePreprocess from 'svelte-preprocess'


export default defineConfig({
  root: './',
  build: {
    outDir: './build'
  },
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  plugins: [
    svelte({
      preprocess: [sveltePreprocess({ typescript: true })]
    }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, './data/3Dmodels/cars') + '/*',
          dest: './3dmodels'
        },
        {
          src: path.resolve(__dirname, './data/3Dmodels/wheels') + '/*',
          dest: './3dmodels'
        }
      ]
    })
  ]
});