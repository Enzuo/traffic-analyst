<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphs/uPlotRealtime'

  export let title
  export let units
  export let colors
  export let key
  export let transformFn

  export let time
  export let observed 
  
  let chart
  onMount(() => {
    let chartElement = document.getElementById('chart')	
    
    chart = createGraph({title, units, key, transformFn, colors}, observed, chartElement)
  })

  const updateGraph = (t) => {
    if(chart){
      chart.updateData(t, observed)
    }
  }

  $: updateGraph(time)

</script>

<div id="chart"></div>