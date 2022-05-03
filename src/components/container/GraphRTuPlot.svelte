<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphRTuPlot'

  export let title
  export let units
  export let key
  export let time
  export let observed 
  let dataHistory = [[], []]

  
  let chart
  onMount(() => {
    let chartElement = document.getElementById('chart')			
    chart = createGraph({title, units},chartElement)
  })

  const updateGraph = (t) => {
    if(chart){
      dataHistory[0].push(t/1000)
      dataHistory[1].push(observed[key])

      chart.setData(dataHistory)
    }
  }

  $: updateGraph(time)

</script>

<div id="chart"></div>