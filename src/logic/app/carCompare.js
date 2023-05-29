import * as cardata from '@/logic/cardata'
import {CarEntity, updateForces} from '@/logic/carLogic/CarEntity'
import {Simulation} from '@/logic/simulation2'


export function carCompare(carIds){
  const carEntities = []
  for(var i=0; i<carIds.length; i++){
    let carSpecs
    try {

      if(carIds[i] instanceof Array){
        carSpecs = cardata.getCar(carIds[i][0], carIds[i][1])
      }
      else {
        carSpecs = cardata.getCar(carIds[i])
      }

      let carEntity = new CarEntity(carSpecs)
      carEntity.state.throttleInput = 1
      carEntities.push(carEntity)
    }
    catch(e){

    }
  }


  // create simulation
  let simulation = Simulation()
  simulation.subscribeTick((t, dt) => {
    for(let i=0; i<carEntities.length; i++){
      let carEntity = carEntities[i]
      carEntity = updateForces(carEntity, dt)

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

  return {carEntities, simulation}
}