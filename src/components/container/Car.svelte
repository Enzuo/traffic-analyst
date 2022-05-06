<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'
  import GraphRtUplot from './UPlotRealtime.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carphysics/physics'
  import UPlotGearing from './UPlotGearing.svelte'

  import '@/logic/3d'



  let carIds = ['peugeot_206', 'renault_zoe', 'hyundai_i20', 'renault_trafic2' ]

  let carEntities = []
  for(var i=0; i<carIds.length; i++){
    let carSpecs
    if(carIds[i] instanceof Array){
      carSpecs = cardata.getCar(carIds[i][0], carIds[i][1])
    }
    else {
      carSpecs = cardata.getCar(carIds[i])
    }

    let carEntity = Car.create(carSpecs)
    carEntity.state.throttleInput = 1
    carEntities.push(carEntity)
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
  Time simulation elapsed : {(time/1000).toFixed(1)}
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
<GraphRtUplot 
  title="Acceleration" 
  units="m/s²" 
  key="acceleration" 
  time={time}
  observed={carEntities}
></GraphRtUplot>
<!-- <GraphRtUplot 
  title="Power" 
  units="kw" 
  key="power" 
  time={time}
  observed={carEntity.state}
></GraphRtUplot> -->