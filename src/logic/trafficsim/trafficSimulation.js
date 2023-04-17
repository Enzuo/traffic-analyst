import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { createCarEntity, updateForces } from "@/logic/carLogic/carEntity";

export default function trafficSimumlation () {

  let cars = [createCar()]
  let drivers = [createDriver(cars[0])]

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

function createCar(){
  let car = createCarEntity(getCar('renault_zoe'))
  car.state.throttleInput = 1
  car.state.position = 0
  return car
}

function createDriver(car){

  const TARGET_SPEED = 15
  
  function think(t, dt, cars){
    let carInFront = detectCarInFront(car, cars)
    if (carInFront) {

    }

    const currentSpeed = car.state.speed
    if(currentSpeed < TARGET_SPEED) {
      applyThrottle(0.1)
    }
    if(currentSpeed > TARGET_SPEED) {
      applyThrottle(-0.1)
    }
  }


  let currentBrake = 0
  let currentThrottle = 0
  function applyBrake(val){
    currentThrottle = 0

    currentBrake = currentBrake + val
    currentBrake = Math.min(Math.max(currentBrake, 0), 1)
    car.state.brakeInput = currentBrake
  }

  function applyThrottle(val){
    currentBrake = 0
    
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
  let nearestCarDistance 
  for(var i = 1; i<cars.length; i++){
    if(cars[i].id === car.id) {
      continue
    }
    let distanceToCar = cars[i].position - car.position
    if(!nearestCar){
      nearestCar = cars[i]
      nearestCarDistance = distanceToCar
      continue
    }
    if(distanceToCar > 0 && distanceToCar < nearestCarDistance){
      nearestCar = cars[i]
      nearestCarDistance = distanceToCar
    }
  }
  return {car: nearestCar, distance: nearestCarDistance}
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
