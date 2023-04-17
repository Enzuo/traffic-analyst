import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { createCarEntity, updateForces } from "@/logic/carLogic/carEntity";

export default function trafficSimumlation () {

  let cars = [createCar(20), createCar(0)]
  let drivers = [createDriver(cars[0]), createDriver(cars[1], 25)]

  let simulation = Simulation()
  simulation.subscribeTick((t, dt) => {

    drivers.forEach((driver) => {
      driver.think(t, dt, cars)
    })

    cars.forEach((car) => {
      updateForces(car, dt)
      let speed = car.state.speed
      car.state.position += speed * (dt / 1000)
    })


  })

  simulation.start()

  return {simulation, cars}
}

function createCar(position=0, speed=0){
  let car = createCarEntity(getCar('renault_zoe'))
  car.state.position = position
  car.state.speed = speed
  return car
}

let UNIQUE_DRIVERID = 1
function createDriver(car, targetSpeed=15){

  const id = UNIQUE_DRIVERID++

  const ANTICIPATION_DISTANCE_TIME = 2.5
  const MIN_DISTANCE = 8
  
  function think(t, dt, cars){
    let carInFront = detectCarInFront(car, cars)
    if (carInFront) {
      let distanceTime = carInFront.distance / car.state.speed
      let distanceTimeRelativeSpeed = carInFront.distance / Math.max((car.state.speed - carInFront.car.state.speed), 1)
      // if(id === 2) console.log("distanceTime", distanceTime, car.state.speed, carInFront)
      if(carInFront.distance < MIN_DISTANCE){
        applyBrake(0.1)
        return
      }
    }

    const currentSpeed = car.state.speed
    if(currentSpeed < targetSpeed) {
      applyThrottle(0.1)
    }
    if(currentSpeed > targetSpeed) {
      applyThrottle(-0.1)
    }
  }


  let currentBrake = 0
  let currentThrottle = 0
  function applyBrake(val){
    currentThrottle = 0
    car.state.throttleInput = 0

    currentBrake = currentBrake + val
    currentBrake = Math.min(Math.max(currentBrake, 0), 1)
    car.state.brakeInput = currentBrake
  }

  function applyThrottle(val){
    currentBrake = 0
    car.state.brakeInput = 0
    
    currentThrottle = currentThrottle + val
    currentThrottle = Math.min(Math.max(currentThrottle, 0), 1)
    car.state.throttleInput = currentThrottle
  }
  
  
  return {
    think
  }
}

function detectCarInFront(car, cars){
  let nearestCar
  let nearestCarDistance = 10000
  for(var i = 0; i<cars.length; i++){
    if(cars[i].id === car.id) {
      continue
    }
    let distanceToCar = cars[i].state.position - car.state.position
    // if(!nearestCar){
    //   nearestCar = cars[i]
    //   nearestCarDistance = distanceToCar
    //   continue
    // }
    if(distanceToCar > 0 && distanceToCar < nearestCarDistance){
      nearestCar = cars[i]
      nearestCarDistance = distanceToCar
    }
  }
  return nearestCar ? {car: nearestCar, distance: nearestCarDistance} : null
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
