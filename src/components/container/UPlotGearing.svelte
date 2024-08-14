<script>
  import {createGraph} from '@/logic/graphs/uPlotGearing'
  import Icon from '../presentation/Icon.svelte'

  export let car
  export let showForce=true
  let chartElement
  let hasError

  $ : if(chartElement) {
    chartElement.innerHTML = ''
    try {
      createGraph(car, chartElement, {isGearForce:showForce})
      hasError = false
    }
    catch(e){
      hasError = true
    }
  }

</script>

<div bind:this={chartElement}></div>
{#if hasError}<div class="graph-error">!<Icon name="wrench"></Icon></div>{/if}