<script>
  import { updateForces } from "@/logic/carLogic/carEntity";
  import { createTrafficGraph } from "@/logic/graphs/svgTrafficGraph"
  import trafficSimulation from "@/logic/trafficsim/trafficSimulation"
  import { onMount } from "svelte"
  import UPlotRealtime from "./UPlotRealtime.svelte"
  import UPlotFnGraph from "@/components/container/UPlotFnGraph.svelte"
  import { onDestroy } from 'svelte';


  export let showUI = false


  let container
  let time
  let cars
  let drivers
  let simulation
  let selectedCar

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

  onDestroy(() => {
    if(simulation){
      simulation.stop()
    }
  })

  function updateDrivers(time){
    return drivers
  }

  function handleCarClick(e) {
    console.log('click', e)
    let car = e.detail
    selectedCar = cars.find(c => c.id === car.id)
  }

  function mstokmh(ms){
    return ms * 3.6
  }

  function handleStopCar() {
    drivers[0].stopCar()
  }

  function handleSimStop() {
    simulation.isPlaying ? simulation.stop() : simulation.start()
  }



</script>

<div class="graph" on:carClick={handleCarClick} bind:this={container}></div>

{#if showUI}
<button on:click={handleSimStop}>Stop Simulation</button>
<button on:click={handleStopCar}> stop first car</button>

{#if selectedCar}
Selected Car : {selectedCar.id}
<div class="grid">
  <UPlotRealtime
  title="Speed"
  key="speed"
  transformFn={mstokmh}
  time={time}
  observed={[selectedCar]}
  ></UPlotRealtime>
  <UPlotRealtime
  title="Brake"
  key="brakeInput"
  time={time}
  observed={[selectedCar]}
  ></UPlotRealtime>
  <UPlotRealtime
  title="Throttle"
  key="throttleInput"
  time={time}
  observed={[selectedCar]}
  ></UPlotRealtime>
</div>
{/if}

{#if drivers && true === false}
  {#each drivers as d}
  <li>
    {d.currentTask}
    {#if d.frontCar}
      Distance to car in front : {Math.round(d.distance)} - {(d.TTC).toFixed(1)} - {Math.round(d.TTI)}
    {:else}
      Distance --
    {/if}
    {#if d.plannedSpeedCurve}
      {d.plannedSpeedCurve}
      <UPlotFnGraph fn={d.plannedSpeedCurve.getYForX}></UPlotFnGraph>
    {:else}
      <UPlotFnGraph></UPlotFnGraph>
    {/if}
  </li>
  {/each}
{/if}
{/if}

<style>
	.graph { width: 100%; height: 200px; }

  .graph-placeholder {
    height:50px;
    width:50px;
  }
</style>