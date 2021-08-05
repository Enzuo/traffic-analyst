<script>
  import RealTimeGraph from '@/components/container/RealTimeGraph.svelte'
  import {Simulation} from '@/logic/simulation'
  import RoadGraph from './RoadGraph.svelte'
  
  const my_sim = Simulation()

  let elapsedTime = 0

  let cancelLoopHandler
  const runLoop = (t) => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    
    my_sim.forward(t)
    elapsedTime = my_sim.getState().elapsedTime
  }
  setTimeout(() => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
  }, 500)

  const killSimulation = () => {
    window.cancelAnimationFrame(cancelLoopHandler)
  }


  // let observedCar = null
  let observedCar = my_sim.getState().cars[1]
  const handleCarClick = (id) => {
    observedCar = my_sim.getState().road.getCar(id)
  }
  const stopCar = () => {
    observedCar.setSpeed(0)
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
  <RoadGraph road={my_sim.getState().road} onCarClick={handleCarClick}></RoadGraph>
  {#if observedCar}
  Id : {observedCar.id}
  <button on:click={stopCar}>Stop</button>

  <div class="graph-panel">
    <RealTimeGraph 
      title="Throttle" 
      options={{viewY: 1, viewX: 30}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.throttle]
      }}
    />
    <RealTimeGraph 
      title="Brake" 
      options={{viewY: 1, viewX: 30}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.brake]
      }}
    />
    <RealTimeGraph 
      title="Power" 
      options={{viewY: 100, viewX: 30}} 
      observeData={() => {
        // if(!my_sim.getState().car) return [0,0]
        let carState = observedCar.state
        return [elapsedTime/1000, carState.power]
      }}
    />
    <RealTimeGraph 
      title="Speed" 
      options={{viewY: 150, viewX: 30}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.speed * 3.6]
      }}
    />
  </div>
  <div class="graph-panel">
    <RealTimeGraph 
      title="Acceleration" 
      options={{viewY: 10, viewX: 30}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.acceleration]
      }}
    />
    <RealTimeGraph 
      title="Torque" 
      options={{viewY: 250, viewX: 30}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.torque]
      }}
    />
    <RealTimeGraph 
      title="Force" 
      options={{viewY: 7000, viewX: 30, gridY:700}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.force]
      }}
    />
    <RealTimeGraph 
      title="AirDrag" 
      options={{viewY: 7000, viewX: 30, gridY:700}} 
      observeData={() => {
        let carState = observedCar.state
        return [elapsedTime/1000, carState.airDrag]
      }}
    />
  </div>
  {/if}
</div>