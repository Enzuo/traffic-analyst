<script>
  import { updateForces } from "@/logic/carLogic/carEntity";
  import { createTrafficGraph } from "@/logic/graphs/svgTrafficGraph"
  import trafficSimulation from "@/logic/trafficsim/trafficSimulation";
  import { onMount } from "svelte"
  import UPlotRealtime from "./UPlotRealtime.svelte";


  let container
  let time
  let cars
  let drivers

  $: drivers = updateDrivers(time)

  onMount(() => {
    let sim = trafficSimulation()
    cars = sim.cars
    drivers = sim.drivers
    console.log('traffic sim cars', cars)
    createTrafficGraph(container, cars)
    container.addEventListener('carClick', handleCarClick)
    sim.simulation.subscribeTick((t, dt) => {
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


</script>

<div class="graph" on:carClick={handleCarClick} bind:this={container}></div>

<UPlotRealtime 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  observed={cars}
></UPlotRealtime>

{#if drivers}
  {#each drivers as d}
  <li>
    {#if d.frontCar}
      Distance to car in front : {Math.round(d.distance)} - {Math.round(d.distanceTTC)} - {Math.round(d.TTC)}
    {:else}
      Distance --
    {/if}
  </li>
  {/each}
{/if}


<style>
	.graph { width: 100%; height: 200px; }
</style>