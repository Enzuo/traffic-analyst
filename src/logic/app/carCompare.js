import * as cardata from '@/logic/cardata'
import * as Car from '@/logic/carphysics/carEntity'
import {Simulation} from '@/logic/simulation2'
import * as threeD from '@/logic/3d'



export function carCompare(carIds){
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
  async function setup3Dsimulation (element, colors) {
    // create scene
    let threeAnimation = threeD.createThreeAnimation(element)
    
    // loading
    await threeD.loadMaterials()

    // create cars
    let cars = []
    for(let i=0; i<carEntities.length; i++){
      let car = threeD.createCar(threeAnimation, carEntities[i], i, carEntities.length, colors[i])
      cars.push(car)
    }
    
    simulation.subscribeTick((t, dt) => {
      for(let i=0; i<cars.length; i++){
        cars[i].update(dt, carEntities[i])
      }
    })
  }

  return {carEntities, simulation, setup3Dsimulation}
}