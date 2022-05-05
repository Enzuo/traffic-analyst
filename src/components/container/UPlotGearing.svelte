<script>
  import { onMount } from 'svelte'
  import {createGraph} from '@/logic/graphs/uPlotGearing'

  export let car

  onMount(() => {
    let chartElement = document.getElementById('graph')			
    createGraph(car, chartElement)
  })

</script>

<div id="graph"></div>