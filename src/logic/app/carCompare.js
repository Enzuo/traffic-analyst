import cardata from '@/logic/cardata'
import {CarEntity, updateForces} from '@/logic/lib/CarEntity'
import {Simulation} from '@/logic/simulation2'


/**
 *
 * @param {{id, tid, cid}[]} carIds
 * @returns
 */
export function carCompare(carIds){
  const carEntities = []
  for(var i=0; i<carIds.length; i++){
    let carSpecs
    try {

      carSpecs = cardata.car.get(carIds[i].id, carIds[i].tid, carIds[i].cid)

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
      const maxRpm = carEntity.props.engine.torqueCurve.length ? carEntity.props.engine.torqueCurve[carEntity.props.engine.torqueCurve.length-1][0] : 0
      // maxRpm = 3500
      if(carEntity.state.engineRpm >= maxRpm){
        // carEntity.state.throttleInput = 0
        let maxGear = carEntity.props.gearbox.gearRatio.length - 1
        if(carEntity.state.gearInput < maxGear){
          carEntity.state.gearInput += 1
        }
      }

      carEntities[i] = carEntity
    }
  })

  return {carEntities, simulation}
}