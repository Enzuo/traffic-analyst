import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { createCarEntity } from "../carLogic/carEntity";

export default function trafficSim () {

  let simulation = Simulation()
  simulation.subscribeTick((t, dt) => {

  })


}

function addCar(){
  let car = createCarEntity(getCar('renault_zoe'))
  return car
}