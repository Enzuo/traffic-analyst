<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphRTuPlot'

  export let title
  export let units
  export let data = [[], []]

  
  let chart
  onMount(() => {
    let chartElement = document.getElementById('chart')			
    chart = createGraph({title, units},chartElement)
  })

  const updateGraph = (data) => {
    if(chart){
      chart.setData(data)
    }
  }

  $: updateGraph(data)

</script>

Graph : 
<div id="chart"></div>