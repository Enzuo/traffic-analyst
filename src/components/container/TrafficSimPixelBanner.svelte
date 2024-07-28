<script>
  import { createTrafficScene } from '@/logic/2DScene/TrafficScene'
  import trafficSimulation from '@/logic/trafficsim/trafficSimulation'
  import { onMount } from 'svelte'

  export let traffic_sim

  let canvas

  onMount(() => {
    createTrafficScene(canvas, traffic_sim)

    // tra = new PixelTrafficGraph(canvas)

    // const ctx = canvas.getContext('2d')
    // Initialize and start the real-scale 2D traffic view here
  })
</script>

<canvas bind:this={canvas} width="960" height="100" ></canvas>

<style>
  canvas {
    /* width: 512px; */
    height: 200px;
    image-rendering: pixelated;
  }
</style>