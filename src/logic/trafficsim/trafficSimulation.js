import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { createCarEntity, updateForces } from "@/logic/carLogic/carEntity";

export default function trafficSimumlation () {

  const cars = [createCar(20), createCar(0), createCar(-10), createCar(-20), createCar(-40)]
  const drivers = [createDriver(cars[0]), createDriver(cars[1], 25), createDriver(cars[2], 25), createDriver(cars[3], 25, DRIVER_PROFILES.DEFENSIVE), createDriver(cars[4], 25, DRIVER_PROFILES.AGGRESSIVE)]

  const carCreator = createIntervalTicker(4000)
  const DELETE_DISTANCE = 200

  const simulation = Simulation()
  simulation.subscribeTick((t, dt) => {

    carCreator.tickAtInterval(t, () => {
      let car = createCar(-50, 20)
      let driver = createDriver(car)
      cars.push(car)
      drivers.push(driver)
    })

    drivers.forEach((driver) => {
      driver.think(t, dt, cars)
    })

    cars.forEach((car, index) => {
      updateForces(car, dt)
      let speed = car.state.speed
      car.state.position += speed * (dt / 1000)

      //
      if(car.state.position > DELETE_DISTANCE){
        // TODO improve delete
        cars.shift()
        drivers.shift()
      }
    })


  })

  simulation.start()

  return {simulation, cars, drivers}
}

function createCar(position=0, speed=0){
  let car = createCarEntity(getCar('renault_zoe'))
  car.state.position = position
  car.state.speed = speed
  return car
}

function findCarDriver(car, drivers){
  return drivers.findIndex(d => {
    return d.car.id === car.id
  })
}





let DRIVER_PROFILES = {
  AGGRESSIVE : {
    MIN_TIME_TO_CONTACT : 0.6,
    ANTICIPATION_DISTANCE_TIME : 1,
    MIN_DISTANCE : 2,
    MAX_THROTTLE : 1
  },
  NORMAL : {
    ANTICIPATION_DISTANCE_TIME : 3,
    MIN_DISTANCE : 3,
    MAX_THROTTLE : 0.6
  },
  DEFENSIVE : {
    MIN_TIME_TO_CONTACT : 3,
    ANTICIPATION_DISTANCE_TIME : 20,
    MIN_DISTANCE : 9,
    MAX_THROTTLE : 0.6
  }
}

let UNIQUE_DRIVERID = 1
function createDriver(car, targetSpeed=15, profile=DRIVER_PROFILES.NORMAL){

  const id = UNIQUE_DRIVERID++

  const MIN_TIME_TO_INTERCEPT = 2.5 // time to reach object taking into account object speed
  const MIN_TIME_TO_CONTACT = profile.MIN_TIME_TO_CONTACT || 1 // time to reach object if it was not moving
  const ANTICIPATION_DISTANCE_TIME = profile.ANTICIPATION_DISTANCE_TIME
  const MIN_DISTANCE = profile.MIN_DISTANCE
  const MAX_THROTTLE = profile.MAX_THROTTLE

  let shouldStopCar = false
  let shouldStopCarTime
  const conciousThink = createIntervalTicker(1000)
  let carInFront
  let time
  
  function think(t, dt, cars){
    time = t
    const currentSpeed = car.state.speed

    conciousThink.tickAtInterval(t, () => {
      if(shouldStopCar && t > (shouldStopCarTime + 2000)){
        shouldStopCar = false
      }
      carInFront = detectCarInFront(car, cars)
    })
    if(shouldStopCar){
      applyBrake(0.2)
      return
    }
    if (carInFront) {
      let distanceToCarInFront = carInFront.distance // getDistanceBetweenCar(carInFront.car, car)
      let timeToContact = distanceToCarInFront / currentSpeed
      let timeToIntercept = distanceToCarInFront / Math.max((car.state.speed - carInFront.car.state.speed), 1)
      // if(id === 2) console.log("distanceTime", distanceTime, car.state.speed, carInFront)
      if(timeToIntercept < MIN_TIME_TO_INTERCEPT){
        applyBrake(0.2)
        return
      }
      if(distanceToCarInFront < (MIN_DISTANCE*(1+currentSpeed/20))){
        applyBrake(0.1)
        return
      }
      if(timeToContact < MIN_TIME_TO_CONTACT){
        applyThrottle(-0.05)
        return
      }
      if(timeToContact < ANTICIPATION_DISTANCE_TIME && carInFront.speed < currentSpeed && car.state.acceleration > 0.1){
        applyThrottle(-0.1)
        return
      }
    }

    if(currentSpeed < targetSpeed) {
      applyThrottle(0.05, MAX_THROTTLE)
    }
    if(currentSpeed > targetSpeed) {
      applyThrottle(-0.1, MAX_THROTTLE)
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

  function applyThrottle(val, maxVal=1){
    currentBrake = 0
    car.state.brakeInput = 0
    
    currentThrottle = currentThrottle + val
    currentThrottle = Math.min(Math.max(currentThrottle, 0), maxVal)
    car.state.throttleInput = currentThrottle
  }

  function stopCar(){
    shouldStopCar = true
    shouldStopCarTime = time
  }
  
  
  return {
    think, 
    stopCar,
    get frontCar() { return carInFront }, 
    get car() { return car },
    get distance() { return getDistanceBetweenCar(carInFront.car, car)},
    get distanceTTC() { return carInFront ? getDistanceBetweenCar(carInFront.car, car)/car.state.speed : null},
    get TTC() { return carInFront ? getDistanceBetweenCar(carInFront.car, car)/Math.max((car.state.speed - carInFront.speed), 1) : null},
  }
}

function detectCarInFront(car, cars){
  let nearestCar
  let nearestCarDistance = 10000
  for(var i = 0; i<cars.length; i++){
    if(cars[i].id === car.id) {
      continue
    }
    let distanceToCar = getDistanceBetweenCar(cars[i], car)
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
  return nearestCar ? {car: nearestCar, distance: nearestCarDistance, speed : nearestCar.state.speed} : null
}

/**
 * 
 * @param {CarEntity} firstCar 
 * @param {CarEntity} secondCar 
 * @returns 
 */
function getDistanceBetweenCar(firstCar, secondCar){
  return (firstCar.state.position - firstCar.props.length/2000) - (secondCar.state.position + secondCar.props.length/2000)
}



function createIntervalTicker(interval) {
  let lastTick = 0
  return {
    tickAtInterval : (t, cb) => {
      if (t - lastTick >= interval) {
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
