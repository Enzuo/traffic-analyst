/**
 * Driver simple
 * Operate his vehicle following simple instructions, no personnal agency
 */

import { getInstruction } from "./SimulationScenario";

/**
 *
 * @param {CarEntity} car
 * @param {SimulationScenario} scenario
 */
export function createDriverSimple(car, scenario){


  function update(time, dt){
    let {speed} = getInstruction(scenario, time+11) // DEBUG +11
    let targetSpeed = speed / 3.6 //kmh to ms
    if(car.state.speed < targetSpeed){
      car.state.throttleInput = Math.min(car.state.throttleInput + 0.1, 1)
    }
    else {
      car.state.throttleInput = Math.max(car.state.throttleInput - 0.1, 0)
    }
  }


  return {
    update
  }
}
