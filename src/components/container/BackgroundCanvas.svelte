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

<div style="positoin: relative">
  <canvas bind:this={canvas} width="640" height="480"/>

  <DebugPerformanceGraph debugPerf={debugPerf}></DebugPerformanceGraph>
</div>