import cardata from '@/logic/cardata'
import {CarEntity, updateForces} from '@/logic/trafficsim/CarEntity'
import {SimulationRunner} from '@/logic/trafficsim/SimulationRunner'
import { createDriverSimple } from './DriverSimple'
import { SCENARIOS } from './SimulationScenario'


/**
 *
 * @param {{id, tid, cid}[]} carIds
 * @returns
 */
export function carCompare(carIds){
  const carEntities = []
  const drivers = []
  for(var i=0; i<carIds.length; i++){
    let carSpecs
    try {

      carSpecs = cardata.car.get(carIds[i].id, carIds[i].tid, carIds[i].cid)

      let carEntity = new CarEntity(carSpecs)
      let driver = createDriverSimple(carEntity, SCENARIOS.find(s => s.name === 'floor it'))
      // carEntity.state.throttleInput = 1
      carEntities.push(carEntity)
      drivers.push(driver)
    }
    catch(e){

    }
  }


  // create simulation
  let simulation = SimulationRunner()
  simulation.subscribeTick((t, dt) => {
    carEntities.forEach(carEntity => {
      carEntity.update(t, dt)
    })
    drivers.forEach(driver => {
      driver.update(t, dt)
    })
  })

  return {carEntities, simulation}
}