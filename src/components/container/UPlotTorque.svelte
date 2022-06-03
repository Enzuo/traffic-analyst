<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphs/uPlotTorque'

  export let cars
  export let opts

  onMount(() => {
    let chartElement = document.getElementById('graph')			
    createGraph(cars, chartElement, opts)
  })

</script>

<div id="graph"></div>