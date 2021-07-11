<script lang="ts">
  import { onMount } from "svelte"
  // import { SVG } from '@svgdotjs/svg.js'
  import realtimegraph from '@/logic/realtimegraph'

  export let observeData : () => [number, number] 

  let container
  let margin = 25

  let graph = realtimegraph()
  $: graph.setOptions({margin})
  

  onMount(() => {
    graph.init(container)
    graph.run(observeData)
  });


</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph" bind:this={container} /> 
Margin : <input bind:value={margin}/>