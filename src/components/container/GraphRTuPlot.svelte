<script>
  import { onMount } from 'svelte'
  import { createGraph } from '@/logic/graphRTuPlot'

  export let title
  export let units
  export let key
  export let time
  export let transformFn
  export let observed 
  let dataHistory = [[], []]

  
  let chart
  onMount(() => {
    let chartElement = document.getElementById('chart')	
    
    chart = createGraph({title, units, key, transformFn}, observed, chartElement)
  })

  const updateGraph = (t) => {
    if(chart){
      chart.updateData(t, observed)
      // let value = transformFn ? transformFn(observed[key]) : observed[key]
      // dataHistory[0].push(t/1000)
      // dataHistory[1].push(value)

      // chart.setData(dataHistory)
    }
  }

  $: updateGraph(time)

</script>

<div id="chart"></div>