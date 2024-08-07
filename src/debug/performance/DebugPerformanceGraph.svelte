<script>
  import { createPerformanceGraph  } from './PerformanceGraph';
  import { onMount } from 'svelte'

  export let top = 0
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

<div style="top: {top}">
  <canvas bind:this={canvas} width="36" height="16"></canvas>
</div>

<style>
  div {
    position:absolute;
    top:0;
    right:0;
  }
  canvas {
    /* width: 512px; */
    height: 32px;
    image-rendering: pixelated;
  }
</style>
