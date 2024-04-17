<script>
  import { createTrafficGraph } from '@/logic/graphs/svgTrafficGraph';
  import followingDistanceSim from '@/logic/trafficsim/followingDistanceSim';
  import {onMount, onDestroy} from 'svelte'

  let acdasim
  let cars
  let simulation
  let tgraph
  let graphContainer
  let time

  onMount(() => {
    acdasim = followingDistanceSim()
    cars = acdasim.cars
    simulation = acdasim.simulation

    tgraph = createTrafficGraph(graphContainer, cars)

    acdasim.simulation.subscribeTick((t, dt) => {
      time = t
    })
  })

  onDestroy(() => {
    if(simulation){
      simulation.stop()
    }
    if(tgraph){
      tgraph.destroy()
    }
  })

  function handleSimStop() {
    simulation.isPlaying ? simulation.stop() : simulation.start()
  }
</script>

<div class="graph" bind:this={graphContainer}></div>

{#if simulation}
<button on:click={handleSimStop}>{simulation.isPlaying ? 'Stop' : 'Start' } Simulation</button>
{/if}


<style>
	.graph { width: 100%; height: 200px; }

  .graph-placeholder {
    height:50px;
    width:50px;
  }
</style>