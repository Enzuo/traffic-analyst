<script>
  import DebugPerformanceGraph from '@/debug/performance/DebugPerformanceGraph.svelte'
  import { createScene } from '@/logic/3DsceneGraph/TestScene'
  import { onMount, onDestroy } from 'svelte'

  let graphContainer
  let debugPerf
  let scene

  let tireCode = '205/55R15'

  $: updateWheelCode(tireCode)

  function updateWheelCode(code){
    console.log(tireCode)
    if (scene && scene.setWheelCode) {
      scene.setWheelCode(tireCode)
    }
  }

  onMount(() => {
    scene = createScene(graphContainer)
    debugPerf = scene.debugPerf
  })

  onDestroy(() => {
    if (scene) {
      scene.destroy()
    }
  })
</script>

3D Playground test scene :

<div class="graph" bind:this={graphContainer}></div>

<DebugPerformanceGraph {debugPerf}></DebugPerformanceGraph>

<input bind:value={tireCode} />

<style>
  .graph {
    width: 400px;
    height: 400px;
    padding-top: 15px;
  }
</style>
