<script lang="ts">
  import { onMount } from "svelte"
  // import { SVG } from '@svgdotjs/svg.js'
  import realtimegraph from '@/logic/realTimeGraph'

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


</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<h1>{title}</h1>
<div class="graph" bind:this={container} /> 
Margin : <input bind:value={margin}/>
Width : <input bind:value={width}/>