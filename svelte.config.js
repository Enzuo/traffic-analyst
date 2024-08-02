import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-auto'
import adapterStatic from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		// adapter: adapter()
		adapter: adapterStatic({
      fallback: 'index.html',
    }),
    paths: {
      base: process.env.NODE_ENV === "production" ? "/traffic-analyst" : "",
    },
    version: {
      name: pkg.version
    }
	},

  extensions: [
    '.svelte',
    '.svx'
  ],

  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    vitePreprocess(),
    mdsvex({
      layout: "./src/components/presentation/Article.svelte",
      extension: '.svx',
    }),
  ],
}

export default config
