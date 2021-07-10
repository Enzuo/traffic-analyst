<script lang="ts">
  import { onMount } from "svelte"
  // import { SVG } from '@svgdotjs/svg.js'
  import realtimegraph from '@/logic/realtimegraph'

  export let observeData : () => [number, number] 

  let container
  let graph = realtimegraph()
  let margin = 25

  onMount(() => {
    graph.init(container)
    graph.run(observeData)
  });

  $: graph.setOptions({margin})

</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph" bind:this={container} /> 
Margin : <input bind:value={margin}/>