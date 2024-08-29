<script>
  import DebugPerformanceGraph from "@/debug/performance/DebugPerformanceGraph.svelte"
import { createScene } from "@/logic/3DsceneGraph/TestScene"
  import { onMount, onDestroy } from "svelte"

  let graphContainer
  let debugPerf
  let scene

  onMount(() => {
    scene = createScene(graphContainer)
    debugPerf = scene.debugPerf
  })

  onDestroy(() => {
    if(scene){
      scene.destroy()
    }
  })
</script>

3D Playground test scene :

<div class="graph" bind:this={graphContainer}></div>

<DebugPerformanceGraph debugPerf={debugPerf}></DebugPerformanceGraph>


<style>
	.graph { width: 400px; height: 400px; padding-top:15px; }
</style>