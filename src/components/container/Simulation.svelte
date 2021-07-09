<script>
  import Graph from '@/components/container/Graph.svelte'

  import {Simulation} from '@/logic/simulation'
  const my_sim = Simulation()

  let elapsedTime

  let cancelLoopHandler
  const runLoop = (t) => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    
    my_sim.forward(t)
    elapsedTime = my_sim.currentState().elapsedTime
  }
  cancelLoopHandler = window.requestAnimationFrame(runLoop)

  const killSimulation = () => {
    window.cancelAnimationFrame(cancelLoopHandler)
  }

</script>

<div>
  Hello world
  
  {Math.floor(elapsedTime)}

  <button on:click={killSimulation}>Kill sim</button>
  <Graph getData={() => {
    return [elapsedTime/1000, Math.abs(Math.sin(elapsedTime/1500)*50)]
  }}/>
</div>