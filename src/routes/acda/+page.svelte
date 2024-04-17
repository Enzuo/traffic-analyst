<script>
  import UPlotRealtime from '@/components/container/UPlotRealtime.svelte';
  import { createTrafficGraph } from '@/logic/graphs/svgTrafficGraph';
  import followingDistanceSim from '@/logic/trafficsim/followingDistanceSim';
  import {onMount, onDestroy} from 'svelte'

  let acdasim
  let cars
  let simulation
  let tgraph
  let graphContainer
  let time
  let isPlaying = false

  // simulation parameters
  let speed = 90
  let distance = 40
  let rtime = 1
  let btime = 0.5

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
    isPlaying = simulation.isPlaying
  }

  function updateSim(n) {
    if(!acdasim) return
    acdasim.setOptions({speed, followingDistance : distance, reactionTime : rtime, brakeApplicationTime : btime})
  }

  function mstokmh(ms){
    return ms * 3.6
  }
</script>

<div class="graph" bind:this={graphContainer}></div>

{#if simulation}
<button on:click={handleSimStop}>{isPlaying ? 'Stop' : 'Start' } Simulation</button>
{/if}

<ul>
  <li>Speed in km/h: <input type="number" bind:value={speed} on:change={updateSim}/></li>
  <li>Distance in m: <input type="number" bind:value={distance} on:change={updateSim}/></li>
  <li>Distance in s : {distance/(speed/3.6)}</li>
  <li>Reaction time in s: <input type="number" bind:value={rtime} on:change={updateSim}/></li>
  <li>Brake application time in s: <input type="number" bind:value={btime} on:change={updateSim}/></li>

</ul>

<div class="grid">
  <UPlotRealtime
    title="Brake"
    key="brakeInput"
    time={time}
    observed={cars}
  ></UPlotRealtime>
  <UPlotRealtime
    title="Speed"
    key="speed"
    transformFn={mstokmh}
    time={time}
    observed={cars}
  ></UPlotRealtime>
  <UPlotRealtime
    title="Position"
    key="position"
    time={time}
    observed={cars}
  ></UPlotRealtime>
</div>

<style>
	.graph { width: 100%; height: 200px; }

  .graph-placeholder {
    height:50px;
    width:50px;
  }
</style>