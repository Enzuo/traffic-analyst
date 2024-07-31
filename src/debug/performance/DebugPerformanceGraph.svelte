<script>
  import { createPerformanceGraph  } from './PerformanceGraph';
  import { onMount } from 'svelte'

  /** @type {PerformanceOb} */
  export let debugPerf
  let canvas
  /** @type {PerformanceGraph} */
  let performanceGraph

  $ : setup(debugPerf, performanceGraph)

  function setup(){
    if(!performanceGraph) return
    if(!debugPerf) return
    performanceGraph.setPerformanceObserver(debugPerf)
  }
  onMount(() => {
    performanceGraph = createPerformanceGraph(canvas)

    // tra = new PixelTrafficGraph(canvas)

    // const ctx = canvas.getContext('2d')
    // Initialize and start the real-scale 2D traffic view here
  })
</script>

<canvas bind:this={canvas} width="48" height="16"></canvas>

<style>
  canvas {
    /* width: 512px; */
    height: 32px;
    image-rendering: pixelated;
  }
</style>
