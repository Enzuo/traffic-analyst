<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphs/uPlotRealtime'

  export let title
  export let units
  export let colors = null
  export let key
  export let transformFn

  export let time
  export let observed

  let chart
  let chartElement

  const updateGraph = (t) => {
    if(chart){
      let data = observed.map(o => transformFn ? transformFn(o.state[key]) : o.state[key])
      chart.updateData(t, data)
    }
  }

  function setupGraph (observed, chartElement) {
    if(observed && chartElement){
      chart = createGraph({title, units, key, transformFn, colors}, observed, chartElement)
    }
  }

  $: setupGraph(observed, chartElement)

  $: updateGraph(time)

</script>

<div bind:this={chartElement}></div>