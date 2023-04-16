import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { createCarEntity, updateForces } from "@/logic/carLogic/carEntity";

export default function trafficSimumlation () {

  let car1 = addCar()

  let simulation = Simulation()
  simulation.subscribeTick((t, dt) => {

    updateForces(car1, dt)
    let speed = car1.state.speed
    car1.state.position += speed * (dt / 1000)


  })

  simulation.start()

  return {cars : [car1]}
}

function addCar(){
  let car = createCarEntity(getCar('renault_zoe'))
  car.state.throttleInput = 1
  car.state.position = 0
  return car
}



function createIntervalTicker() {
  let lastTick = 0
  return {
    tickAtInterval : (interval, t, cb) => {
      if(t - lastTick >= interval){
        lastTick = t
        if(cb) {
          cb()
        }
        return true
      }
      return false
    }
  }
}
