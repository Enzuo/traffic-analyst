<script>
  import RealTimeGraph from '@/components/container/RealTimeGraph.svelte'

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
  <RealTimeGraph observeData={() => {
    return [elapsedTime/1000, Math.abs(Math.sin(elapsedTime/1500)*50)]
  }}/>
  <RealTimeGraph 
    title="Torque" 
    options={{viewY: 250, viewX: 30}} 
    observeData={() => {
      let carState = my_sim.currentState().car.getState()
      return [elapsedTime/1000, carState.torque]
    }}
  />
  <RealTimeGraph 
    title="Power" 
    options={{viewY: 10, viewX: 30}} 
    observeData={() => {
      let carState = my_sim.currentState().car.getState()
      return [elapsedTime/1000, carState.power]
    }}
  />
</div>