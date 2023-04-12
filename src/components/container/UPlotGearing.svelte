<script>
  import { onMount } from 'svelte'
  import {createGraph} from '@/logic/graphs/uPlotGearing'

  export let car
  let chartElement

  $ : if(chartElement) {
    chartElement.innerHTML = ''
    createGraph(car, chartElement, )
  }

</script>

<div bind:this={chartElement}></div>