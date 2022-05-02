<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'
  import GraphRtUplot from './GraphRTUplot.svelte'



  let carId = 'renault_zoe'

  let carSpecs = cardata.getCar(carId)

  let carAccelerationSim = Simulation()
  let carEntity = Car.create(carSpecs)
  carEntity.state.throttleInput = 1


  let time = 0
  let engineRpm = 0
  let speed = 0
  let gearInput
  let speedHistory = [[], []]
  let accHistory = [[], []]
  let powerHistory = [[], []]

  carAccelerationSim.addAnimate((t, dt) => {
    carEntity = Car.updateForces(carEntity, dt)

    // switch gear
    let maxRpm = carEntity.props.engine.torqueX[carEntity.props.engine.torqueX.length-1]
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
    
    // update chart
    let acc = carEntity.state.acceleration
    speedHistory[0].push(t/1000)
    speedHistory[1].push(speed*3.6)
    accHistory[0].push(t/1000)
    accHistory[1].push(acc)
    powerHistory[0].push(t/1000)
    powerHistory[1].push(carEntity.state.power)
    speedHistory = speedHistory
    accHistory = accHistory
    powerHistory = powerHistory
  })

  function handleStart() {
    carAccelerationSim.start()
	}
  function handleStop() {
    carAccelerationSim.stop()
	}


  console.log(carSpecs, carEntity)





</script>


Car : {carSpecs.name}

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
  Engine rpm : {Math.floor(engineRpm)}
</div>
<div>
  Gear : {gearInput}
</div>

<GraphRtUplot title="Speed" data={speedHistory}></GraphRtUplot>
<GraphRtUplot units="m/s²" title="Acceleration" data={accHistory}></GraphRtUplot>
<GraphRtUplot units="kw" title="Power" data={powerHistory}></GraphRtUplot>
