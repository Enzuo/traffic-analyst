<script>
  import {createGraph} from '@/logic/graphs/uPlotGearing'

  export let car
  export let showForce=true
  let chartElement

  $ : if(chartElement) {
    chartElement.innerHTML = ''
    createGraph(car, chartElement, {isGearForce:showForce})
  }

</script>

<div bind:this={chartElement}></div>