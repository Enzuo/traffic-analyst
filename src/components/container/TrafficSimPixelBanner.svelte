<script>
  import { createTrafficScene } from '@/logic/2DScene/TrafficScene'
  import trafficSimulation from '@/logic/trafficsim/trafficSimulation'
  import { onMount } from 'svelte'

  let canvas
  let traffic_sim

  onMount(() => {
    traffic_sim = trafficSimulation()

    createTrafficScene(canvas, [])

    // tra = new PixelTrafficGraph(canvas)

    // const ctx = canvas.getContext('2d')
    // Initialize and start the real-scale 2D traffic view here
  })
</script>

<canvas bind:this={canvas} width="256" height="100" ></canvas>

<style>
  canvas {
    /* width: 512px; */
    height: 400px;
    image-rendering: pixelated;
  }
</style>