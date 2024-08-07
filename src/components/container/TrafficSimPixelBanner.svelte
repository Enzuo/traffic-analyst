<script>
  import { createTrafficScene } from '@/logic/2DScene/TrafficScene'
  import trafficSimulation from '@/logic/trafficsim/trafficSimulation'
  import { onMount } from 'svelte'
  import DebugPerformanceGraph from '@/debug/performance/DebugPerformanceGraph.svelte'

  export let traffic_sim

  let canvas
  let debugPerf

  onMount(() => {
    var trafficScene = createTrafficScene(canvas, traffic_sim)
    debugPerf = trafficScene.debug.perf
  })
</script>

<div>
  <canvas bind:this={canvas} width="960" height="100" ></canvas>


  <DebugPerformanceGraph debugPerf={debugPerf}></DebugPerformanceGraph>
</div>


<style>
  canvas {
    /* width: 512px; */
    height: 200px;
    image-rendering: pixelated;
  }
</style>