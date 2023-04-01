import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import chokidar from 'chokidar'; 
import path from 'path';
import { spawn } from 'child_process';


const projectRootDir = path.resolve(__dirname);
const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),

    // https://stackoverflow.com/questions/63427935/setup-tsconfig-path-in-svelte
    alias({
      entries: [
        { find: '@', replacement: path.resolve(projectRootDir, 'src')}
      ]
    }),

    json(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
    copy({
      targets: [
        { src: 'data/3Dmodels/**/*', dest: 'public/build/models' }
      ]
    })
  ],
  watch: {
    clearScreen: false
  }
};


/**------------------------------------
 * Build database
 * ----------------------------------*/

chokidar.watch('data').on('all', (event, path) => {
  console.log(`${event} ${path}`);
  debouncedBuildDatabase();
});



// define a debounce function
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// define a function to run the build command
function buildDatabase() {
  console.log('Building database...');
  const child = spawn('npm run build-db', { shell: true });
  child.stdout.on('data', data => {
    console.log(data.toString());
  });
  child.stderr.on('data', data => {
    console.error(data.toString());
  });
  child.on('exit', code => {
    console.log(`Build process exited with code ${code}`);
  });
}

const debouncedBuildDatabase = debounce(buildDatabase, 1000); // wait for 1 second after the last change
