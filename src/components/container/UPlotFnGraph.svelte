<script>
  import { createGraph } from "@/logic/graphs/uPlotFnGraph"


  export let fn = null
  let lastFn
  let graphElement

  function setupGraph() {
    lastFn = fn
    graphElement.innerHTML = ''
    createGraph(fn, graphElement)
  }

  $ : if(graphElement && fn && fn !== lastFn) setupGraph()


</script>

<div bind:this={graphElement} class="fnGraph"></div>

<style>
  .fnGraph {
    width:50px;
    height:50px;
  }
</style>