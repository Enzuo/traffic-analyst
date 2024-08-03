<script>
  import { onMount, onDestroy } from "svelte"
  import { createBackgroundCanvas } from "@/logic/2DScene/BackgroundCanvas"

  let canvas
  let backgroundCanvas

  onMount(() => {
    backgroundCanvas = createBackgroundCanvas(canvas)
  })

  onDestroy(() => {
    if(backgroundCanvas){
      backgroundCanvas.destroy()
    }
  })

</script>

<canvas bind:this={canvas} width="640" height="480"/>