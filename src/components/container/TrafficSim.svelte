<script>
  import { createTrafficGraph } from "@/logic/graphs/svgTrafficGraph"
  import trafficSimulation from "@/logic/trafficsim/trafficSimulation";
  import { onMount } from "svelte"
  import UPlotRealtime from "./UPlotRealtime.svelte";


  let container
  let time
  let cars

  onMount(() => {
    let sim = trafficSimulation()
    cars = sim.cars
    console.log('traffic sim cars', cars)
    createTrafficGraph(container, cars)
    container.addEventListener('carClick', handleCarClick)
    sim.simulation.subscribeTick((t, dt) => {
      time = t
    })
  })

  function handleCarClick(car) {
    console.log('click', car)
  }

  function mstokmh(ms){
    return ms * 3.6
  }


</script>

<div class="graph" on:carClick={handleCarClick} bind:this={container}></div>

{cars}
<UPlotRealtime 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  observed={cars}
></UPlotRealtime>


<style>
	.graph { width: 100%; height: 200px; }
</style>