<script>
  import RealTimeGraph from '@/components/container/RealTimeGraph.svelte'

  import {Simulation} from '@/logic/simulation'
  const my_sim = Simulation()

  let elapsedTime = 0

  let cancelLoopHandler
  const runLoop = (t) => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    
    my_sim.forward(t)
    elapsedTime = my_sim.currentState().elapsedTime
  }
  setTimeout(() => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
  }, 500)

  const killSimulation = () => {
    window.cancelAnimationFrame(cancelLoopHandler)
  }

</script>

<style>
  .graph-panel {
    display:flex;
    flex-direction:row;
  }
</style>

<div>
  Hello world
  
  {Math.floor(elapsedTime)}
  <button on:click={killSimulation}>Kill sim</button>
  <!-- <RealTimeGraph observeData={() => {
    return [elapsedTime/1000, Math.abs(Math.sin(elapsedTime/1500)*50)]
  }}/> -->
  <div class="graph-panel">
    <RealTimeGraph 
      title="Torque" 
      options={{viewY: 250, viewX: 30}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.torque]
      }}
    />
    <RealTimeGraph 
      title="Power" 
      options={{viewY: 100, viewX: 30}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.power]
      }}
    />
    <RealTimeGraph 
      title="Speed" 
      options={{viewY: 150, viewX: 30}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.speed]
      }}
    />
  </div>
  <div class="graph-panel">
    <RealTimeGraph 
      title="Acceleration" 
      options={{viewY: 10, viewX: 30}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.acc]
      }}
    />
    <RealTimeGraph 
      title="Force" 
      options={{viewY: 7000, viewX: 30, gridY:700}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.force]
      }}
    />
    <RealTimeGraph 
      title="AirDrag" 
      options={{viewY: 7000, viewX: 30, gridY:700}} 
      observeData={() => {
        if(!my_sim.currentState().car) return [0,0]
        let carState = my_sim.currentState().car.getState()
        return [elapsedTime/1000, carState.airDrag]
      }}
    />
  </div>
</div>