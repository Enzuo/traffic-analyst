<script>
  import { createTrafficGraph } from "@/logic/graphs/svgTrafficGraph"
  import trafficSimulation from "@/logic/trafficsim/trafficSimulation";
  import { onMount } from "svelte"


  let container

  onMount(() => {
    let sim = trafficSimulation()
    createTrafficGraph(container, sim.cars)
  })


</script>

<div class="graph" bind:this={container}></div>


<style>
	.graph { width: 100%; height: 200px; }
</style>