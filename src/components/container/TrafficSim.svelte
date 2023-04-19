<script>
  import { updateForces } from "@/logic/carLogic/carEntity";
  import { createTrafficGraph } from "@/logic/graphs/svgTrafficGraph"
  import trafficSimulation from "@/logic/trafficsim/trafficSimulation"
  import { onMount } from "svelte"
  import UPlotRealtime from "./UPlotRealtime.svelte"
  import UPlotFnGraph from "@/components/container/UPlotFnGraph.svelte"


  let container
  let time
  let cars
  let drivers
  let simulation

  $: drivers = updateDrivers(time)

  onMount(() => {
    let tsim = trafficSimulation()
    cars = tsim.cars
    drivers = tsim.drivers
    simulation = tsim.simulation
    console.log('traffic sim cars', cars)
    createTrafficGraph(container, cars)
    container.addEventListener('carClick', handleCarClick)
    tsim.simulation.subscribeTick((t, dt) => {
      time = t
    })
  })

  function updateDrivers(time){
    return drivers
  }

  function handleCarClick(car) {
    console.log('click', car)
  }

  function mstokmh(ms){
    return ms * 3.6
  }

  function handleStopCar() {
    drivers[0].stopCar()
  }

  function handleSimStop() {
    simulation.stop()
  }


</script>

<div class="graph" on:carClick={handleCarClick} bind:this={container}></div>

<button on:click={handleSimStop}>Stop Simulation</button>

<UPlotRealtime 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  observed={cars}
></UPlotRealtime>

<button on:click={handleStopCar}> stop first car</button>

{#if drivers}
  {#each drivers as d}
  <li>
    {#if d.frontCar}
      Distance to car in front : {Math.round(d.distance)} - {Math.round(d.distanceTTC)} - {Math.round(d.TTC)}
    {:else}
      Distance --
    {/if}
    {#if d.plannedSpeedCurve}
      {d.plannedSpeedCurve}
      <UPlotFnGraph fn={d.plannedSpeedCurve.getYForX}></UPlotFnGraph>
    {:else}
      <div class="graph-placeholder"></div>
    {/if}
  </li>
  {/each}
{/if}


<style>
	.graph { width: 100%; height: 200px; }

  .graph-placeholder {
    height:150px;
    width:150px;
  }
</style>