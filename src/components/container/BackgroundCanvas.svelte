<script>
  import { onMount, onDestroy } from "svelte"
  import { createBackgroundCanvas } from "@/logic/2DScene/BackgroundCanvas"
  import DebugPerformanceGraph from '@/debug/performance/DebugPerformanceGraph.svelte'


  let canvas
  let backgroundCanvas
  let debugPerf

  onMount(() => {
    backgroundCanvas = createBackgroundCanvas(canvas)
    debugPerf = backgroundCanvas.debug.perf
  })

  onDestroy(() => {
    if(backgroundCanvas){
      backgroundCanvas.destroy()
    }
  })

</script>

<div class="background">
  <canvas bind:this={canvas} width="480" height="480"/>

  <DebugPerformanceGraph debugPerf={debugPerf}></DebugPerformanceGraph>
</div>

<style>
  .background {
    position: fixed;
    z-index: -10;
    top:250px;
    left:0px;
  }
  canvas {
    height:960px;
    image-rendering: pixelated;
  }
</style>