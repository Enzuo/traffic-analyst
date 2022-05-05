<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'
  import GraphRtUplot from './GraphRTUplot.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carphysics/physics'
  import UPlotGearing from './UPlotGearing.svelte'



  let carIds = ['renault_trafic2', 'hyundai_i20']

  let carEntities = []
  for(var i=0; i<carIds.length; i++){
    let carSpecs = cardata.getCar(carIds[i])
    // console.log(carSpecs)
    let carEntity = Car.create(carSpecs)
    carEntity.state.throttleInput = 1
    carEntities.push(carEntity)
    // console.log(JSON.stringify(carEntities, null, 2))
  }

  
  
  let time = 0
  let engineRpm = 0
  let speed = 0
  let gearInput
  
  let carAccelerationSim = Simulation()
  carAccelerationSim.addAnimate((t, dt) => {
    for(let i=0; i<carEntities.length; i++){
      let carEntity = carEntities[i]
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

      carEntities[i] = carEntity
    }

    
    // update display
    time = t
    // engineRpm = carEntity.state.engineRpm
    // speed = carEntity.state.speed
    // gearInput = carEntity.state.gearInput
  })

  function handleStart() {
    carAccelerationSim.start()
	}
  function handleStop() {
    carAccelerationSim.stop()
	}


  console.log(carEntities)

  function mstokmh(ms){
    return ms * 3.6
  }



</script>
{#each carEntities as carEntity}
  Car : {carEntity.props.name} {carEntity.props.trim}
{/each}
<button on:click={handleStart}>Start</button>
<button on:click={handleStop}>Stop</button>
<br/>
<div>
  Time simulation elapsed : {Math.floor(time)}
</div>
<div>
  Speed : {Math.floor(speed*3.6)}
</div>
<div>
  Power needed : {getPowerRequiredForSpeed(speed, carEntities[0].props.weight, carEntities[0].props.dragCoef * carEntities[0].props.dragArea).toFixed(1)}
</div>

<UPlotGearing car={carEntities[0].props}></UPlotGearing>

<GraphRtUplot 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  observed={carEntities}
></GraphRtUplot>
<!-- <GraphRtUplot 
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
></GraphRtUplot> -->