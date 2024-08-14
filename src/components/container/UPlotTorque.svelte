<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphs/uPlotTorque'
  import Icon from '../presentation/Icon.svelte'

  export let cars
  export let opts = {}

  let chartElement
  let hasError

  $ : if(chartElement) {
    chartElement.innerHTML = ''
    try {
      createGraph(cars, chartElement, opts)
      hasError = false
    }
    catch(e){
      hasError = true
    }
  }

</script>

<div bind:this={chartElement}></div>
{#if hasError}<div class="graph-error">!<Icon name="wrench"></Icon></div>{/if}