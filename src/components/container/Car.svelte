<script>
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'
  import GraphRtUplot from './UPlotRealtime.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carphysics/physics'
  import UPlotGearing from './UPlotGearing.svelte'

  import * as threeD from '@/logic/3d'



  let carIds = ['citroen_2cv', 'peugeot_206' ]


  function carCompare(cars){
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


    // create simulation
    let simulation = Simulation()
    simulation.subscribeTick((t, dt) => {
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
    })




    // create 3d representation
    function createThreeCompare (element) {
      // create scene
      let threeAnimation = threeD.createThreeAnimation(element)
      // create cars
      let cars = []
      for(let i=0; i<carEntities.length; i++){
        let car = threeD.createCar(threeAnimation, i)
        cars.push(car)
      }
      
      simulation.subscribeTick((t, dt) => {
        for(let i=0; i<cars.length; i++){
          cars[i].update(dt, carEntities[i])
        }
      })
    }

    return {carEntities, simulation, createThreeCompare}
  }



  
  
  
  let { carEntities, simulation, createThreeCompare } = carCompare(carIds)
  let time = 0
  let speed = 0
  // simulation observe
  simulation.subscribeTick((t, dt) => {
    time = t
  })

  function handleStart() {
    simulation.start()
	}
  function handleStop() {
    simulation.stop()
	}

  function mstokmh(ms){
    return ms * 3.6
  }

  createThreeCompare(document.body)

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