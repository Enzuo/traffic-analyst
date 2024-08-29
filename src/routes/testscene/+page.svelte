<script>
  import { createScene } from "@/logic/3DsceneGraph/TestScene"
  import { onMount } from "svelte"

  let graphContainer

  onMount(() => {
    createScene(graphContainer)
  })
</script>

3D Playground test scene :

<div class="graph" bind:this={graphContainer}></div>


<style>
	.graph { width: 400px; height: 400px; }
</style>