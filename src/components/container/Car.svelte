<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'
  import GraphRtUplot from './GraphRTUplot.svelte'
  import { getPowerForSpeed } from '@/logic/carphysics/physics'
  import UPlotGearing from './UPlotGearing.svelte'



  let carId = 'hyundai_i20'

  let carSpecs = cardata.getCar(carId)

  let carAccelerationSim = Simulation()
  let carEntity = Car.create(carSpecs)
  carEntity.state.throttleInput = 1


  let time = 0
  let engineRpm = 0
  let speed = 0
  let gearInput

  carAccelerationSim.addAnimate((t, dt) => {
    carEntity = Car.updateForces(carEntity, dt)

    // switch gear
    let maxRpm = carEntity.props.engine.torqueX[carEntity.props.engine.torqueX.length-1]
    // maxRpm = 3500
    if(carEntity.state.engineRpm >= maxRpm){
      // carEntity.state.throttleInput = 0
      let maxGear = carEntity.props.gearRatio.length - 1
      if(carEntity.state.gearInput < maxGear){
        carEntity.state.gearInput += 1
      }
    }
    
    // update display
    time = t
    engineRpm = carEntity.state.engineRpm
    speed = carEntity.state.speed
    gearInput = carEntity.state.gearInput
  })

  function handleStart() {
    carAccelerationSim.start()
	}
  function handleStop() {
    carAccelerationSim.stop()
	}


  console.log(carSpecs, carEntity)

  function mstokmh(ms){
    return ms * 3.6
  }



</script>


Car : {carSpecs.name} {carSpecs.trim}

<button on:click={handleStart}>Start</button>
<button on:click={handleStop}>Stop</button>
<br/>
<div>
  Time simulation elapsed : {Math.floor(time)}
</div>
<div>
  Speed : {Math.floor(speed*3.6)}
  Power needed : {getPowerForSpeed(speed, carEntity.props.weight, carEntity.props.dragCoef * carEntity.props.dragArea)}
</div>
<div>
  Engine rpm : {Math.floor(engineRpm)}
</div>
<div>
  Gear : {gearInput}
</div>

<UPlotGearing car={carSpecs}></UPlotGearing>

<GraphRtUplot 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  observed={carEntity.state}
></GraphRtUplot>
<GraphRtUplot 
  title="Acceleration" 
  units="m/s²" 
  key="acceleration" 
  time={time}
  observed={carEntity.state}
></GraphRtUplot>
<GraphRtUplot 
  title="Power" 
  units="kw" 
  key="power" 
  time={time}
  observed={carEntity.state}
></GraphRtUplot>