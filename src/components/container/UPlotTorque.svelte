<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphs/uPlotTorque'

  export let cars
  export let opts = {}

  let chartElement

  $ : if(chartElement) {
    chartElement.innerHTML = ''
    createGraph(cars, chartElement, opts)
  }

</script>

<div bind:this={chartElement}></div>