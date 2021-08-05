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
    startSimulation()
  }, 500)

  const stopSimulation = () => {
    window.cancelAnimationFrame(cancelLoopHandler)
    cancelLoopHandler = null
  }

  const startSimulation = () => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
  }


  // let observedCar = null
  let observedCar = my_sim.getState().cars[0]
  let observedDriver = my_sim.getState().drivers[1]

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
  <div>
    Time : {Math.floor(elapsedTime)}
    {#if cancelLoopHandler}
      <button on:click={stopSimulation}>Stop sim</button>
    {:else}
      <button on:click={startSimulation}>Restart sim</button>
    {/if}
    {#if observedCar}
      Car id : {observedCar.id}
      <button on:click={stopCar}>Stop car</button>
    {/if}
    Driver id : {observedDriver.id}
  </div>
  <RoadGraph road={my_sim.getState().road} onCarClick={handleCarClick}></RoadGraph>

  <div class="graph-panel">
    <RealTimeGraph 
      title="Distance" 
      options={{viewY: 15, viewX: 30}} 
      observeData={() => {
        let driverState = observedDriver.getState()
        return [elapsedTime/1000, driverState.normalizedDistance]
      }}
    />
    <RealTimeGraph 
      title="Aiming for speed" 
      options={{viewY: 110, viewX: 30}} 
      observeData={() => {
        let driverState = observedDriver.getState()
        return [elapsedTime/1000, driverState.desiredSpeed * 3.6]
      }}
    />
  </div>

  {#if observedCar}
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