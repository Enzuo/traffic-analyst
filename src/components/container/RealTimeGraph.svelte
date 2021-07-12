<script lang="ts">
  import { onMount } from "svelte"
  // import { SVG } from '@svgdotjs/svg.js'
  import realtimegraph from '@/logic/realTimeGraph'
  import { watchResize } from "svelte-watch-resize";


  export let observeData : () => [number, number] 
  export let title : number
  export let options : object

  let container
  let margin = 25
  let width = 500

  let graph = realtimegraph(options)
  $: graph.setOptions({margin, width})
  

  onMount(() => {
    width = container.offsetWidth
    graph.init(container)
    graph.run(observeData)
  });

  const handleResize = () => {
    width = container.offsetWidth
  }


</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph">
  <h1>{title}</h1>
  <div class="graph" bind:this={container} use:watchResize={handleResize}/> 
</div>
