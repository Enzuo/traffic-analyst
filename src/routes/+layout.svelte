<script>
  // Import base path here as there is no way yet to access it in app.html
  // links will incorporate this base path
  // like with sveltekit.assets
  import { base } from '$app/paths'


  // import "nes.css/css/nes.min.css"
  // import "@picocss/pico/css/pico.min.css"
  import "@/styles/reset.css"
  import "@/styles/main.scss"

  // disable ssr for static pages
  export const ssr = false;

</script>

<svelte:head>
  <base href={base + '/'}/>
</svelte:head>


<slot/>
