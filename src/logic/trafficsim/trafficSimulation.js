import { Simulation } from "@/logic/simulation2";
import { getCar } from "../cardata";
import { CarEntity, updateForces } from "@/logic/carLogic/CarEntity";
import { is_function } from "svelte/internal";
import { createEventEmitter } from "../lib/utils";
import { createPerformanceObserver } from "@/debug/performance/PerformanceObserver";

export default function createTrafficSimulation () {

  const emitter = createEventEmitter()
  const debugPerf = createPerformanceObserver()

  const cars = [createCar(20), createCar(-20)]
  const drivers = [
    createDriver(cars[0]),
    // createDriver(cars[1], 25, DRIVER_PROFILES.NORMAL),
    createDriver(cars[1], 25, DRIVER_PROFILES.DEFENSIVE),
  ]

  const carCreator = createIntervalTicker(2000)
  const DELETE_DISTANCE = 2000

  const simulation = Simulation()

  let lastCreatedCar
  simulation.subscribeTick((t, dt) => {
    debugPerf.measureStart()
    carCreator.tickAtInterval(t, () => {
      let position = Math.min(-20, lastCreatedCar ? lastCreatedCar.state.position - 10 : - 20)
      let car = createCar(position, lastCreatedCar ? lastCreatedCar.state.speed : 20)
      lastCreatedCar = car
      let driver = createDriver(car)
      cars.push(car)
      drivers.push(driver)
      emitter.emit('car_created', car)
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

    debugPerf.measureEnd()
  })

  // simulation.start()

  return {...simulation, simulation, cars, drivers, findCarDriver, ...emitter, debug : { perf : debugPerf}}
}

function createCar(position=0, speed=0){
  let car = new CarEntity(getCar('renault_zoe'))
  car.state.position = position
  car.state.speed = speed
  return car
}

function findCarDriver(car, drivers){
  return drivers.findIndex(d => {
    return d.car.id === car.id
  })
}


/**
 *      ____      _
 *     |    \ ___|_|_ _ ___ ___ ___
 *     |  |  |  _| | | | -_|  _|_ -|
 *     |____/|_| |_|\_/|___|_| |___|
 *
 */


let DRIVER_PROFILES = {
  AGGRESSIVE : {
    MIN_TIME_TO_CONTACT : 0.5,
    UNEASY_TTI : 3.5,
    IDEAL_TTC : 0.7,
    ANTICIPATION_TTC : 1,
    MIN_DISTANCE : 2,
    MAX_ACCELERATION : 10
  },
  NORMAL : {
    MIN_TIME_TO_CONTACT : 0.5,
    UNEASY_TTI : 4,
    IDEAL_TTC : 1,
    ANTICIPATION_TTC : 3,
    MIN_DISTANCE : 3,
    MAX_ACCELERATION : 2
  },
  DEFENSIVE : {
    MIN_TIME_TO_CONTACT : 2,
    UNEASY_TTI : 5,
    IDEAL_TTC : 4,
    ANTICIPATION_TTC : 30,
    MIN_DISTANCE : 5,
    MAX_ACCELERATION : 1
  }
}

let UNIQUE_DRIVERID = 1
function createDriver(car, targetSpeed=15, profile=DRIVER_PROFILES.NORMAL){

  const id = UNIQUE_DRIVERID++

  const MIN_TIME_TO_INTERCEPT = 2.5 // time to reach object taking into account object speed
  const UNEASY_TTI = profile.UNEASY_TTI || 4
  const MIN_TIME_TO_CONTACT = profile.MIN_TIME_TO_CONTACT || 0.5 // time to reach object if it was not moving
  const IDEAL_TTC = profile.IDEAL_TTC || 1
  const ANTICIPATION_TTC = profile.ANTICIPATION_TTC || 5
  const MIN_DISTANCE = profile.MIN_DISTANCE
  // TODO replace by max acc
  const MAX_ACCELERATION = profile.MAX_ACCELERATION || 1
  const MAX_THROTTLE = profile.MAX_THROTTLE

  let hasStopCarInstruction = false
  let hasStopCarInstructionTime

  const conciousThink = createIntervalTicker(1000)
  let time
  let carInFront
  let currentTask
  let footOn

  let currentBrake = 0
  let currentThrottle = 0
  let throttleGuess
  // TODO add throttle sensitivity guess by assessing the effect of a throttle guess and the corresponding acc
  // cause throttle input won't have the same effect at all speed with all cars

  let plannedSpeedCurve
  let plannedBrakeCurve

  function think(t, dt, cars){
    time = t
    const dts = dt / 1000
    const currentSpeed = car.state.speed
    const currentAcceleration = car.state.acceleration

    conciousThink.tickAtInterval(t, () => {
      if(hasStopCarInstruction && t > (hasStopCarInstructionTime + 2000)){
        hasStopCarInstruction = false
      }
      carInFront = detectCarInFront(car, cars)

      if(carInFront){
        let distanceToCarInFront = carInFront.distance
        let timeToContact = distanceToCarInFront / currentSpeed
        let timeToIntercept = distanceToCarInFront / Math.max((car.state.speed - carInFront.car.state.speed), 1)
        let isCarInFrontGettingCloser = (carInFront.speed + 3 )< currentSpeed

        if(timeToIntercept < UNEASY_TTI){
          currentTask = 'cuttingSpeed'
          footOn = 'brake'
          plannedBrakeCurve = createLinearCurve(UNEASY_TTI, MIN_TIME_TO_INTERCEPT, 0.05, 0.4)
          return
        }
        if(distanceToCarInFront < MIN_DISTANCE){
          currentTask = 'cuttingDistance'
          footOn = 'brake'
          plannedBrakeCurve = createLinearCurve(MIN_DISTANCE + 2, MIN_DISTANCE, 0, 0.2)
          return
        }
        if(timeToContact < MIN_TIME_TO_CONTACT){
          currentTask = 'increasingTTC'
          footOn = 'throttle'
          plannedSpeedCurve = createLinearCurve(IDEAL_TTC, MIN_TIME_TO_CONTACT, carInFront.speed, carInFront.speed - 5)
          return
        }
        if(timeToContact < ANTICIPATION_TTC){
          footOn = 'throttle'
          let urgency = createLinearCurve(ANTICIPATION_TTC, IDEAL_TTC, 0, 1).getYForX(timeToContact)
          if(currentSpeed > carInFront.speed){
            currentTask = 'easingToTrafficSpeed'
            throttleGuess = reduceThrottleGuess(currentThrottle, urgency, currentAcceleration)

          }
          if(currentSpeed < carInFront.speed){
            currentTask = 'acceleratingToTrafficSpeed'
            throttleGuess = addThrottleGuess(currentThrottle, 1-urgency, currentAcceleration)
          }
          plannedSpeedCurve = createLinearCurve(IDEAL_TTC, ANTICIPATION_TTC, carInFront.speed, targetSpeed)
          return
        }
      }
      currentTask = 'travelingToWantedSpeed'
      footOn = 'throttle'
      throttleGuess = getThrottleToReachSpeed(targetSpeed, currentSpeed, currentThrottle, currentAcceleration)
    })

    if(hasStopCarInstruction){
      applyBrake(0.2)
      return
    }

    if(footOn === 'throttle' && currentBrake > 0){
      applyBrake(-2*dts)
      return
    }

    if (carInFront) {
      let [,distanceToCarInFront] = getDistanceBetweenCar(carInFront.car, car)
      let timeToContact = distanceToCarInFront / currentSpeed
      let timeToIntercept = distanceToCarInFront / Math.max((car.state.speed - carInFront.car.state.speed), 1)


      if(timeToIntercept < MIN_TIME_TO_INTERCEPT/3){
        currentTask = 'godBrake'
        footOn = 'brake'
        applyBrake(3, 3)
        return
      }

      if(timeToIntercept < MIN_TIME_TO_INTERCEPT){
        currentTask = 'avoidingCrash'
        footOn = 'brake'
        applyBrake(0.2)
        return
      }

      if(currentTask === 'cuttingSpeed'){
        let targetBrake = plannedBrakeCurve.getYForX(timeToIntercept)
        applyBrake(0.1, targetBrake)
      }

      if(currentTask === 'cuttingDistance'){
        let targetBrake = plannedBrakeCurve.getYForX(distanceToCarInFront)
        applyBrake(0.02, targetBrake)
      }

      if(currentTask === 'increasingTTC'){
        let targetSpeed = plannedSpeedCurve.getYForX(timeToContact)
        applyThrottleForTargetSpeed(currentSpeed, targetSpeed, currentAcceleration)
      }

      if(currentTask === 'easingToTrafficSpeed'){
        applyThrottleTo(throttleGuess)
      }
      if(currentTask === 'acceleratingToTrafficSpeed'){
        applyThrottleTo(throttleGuess)
      }
    }
    if(currentTask === 'travelingToWantedSpeed'){
      applyThrottleTo(throttleGuess)
    }
  }



  function applyBrake(val, maxVal=1){
    currentThrottle = 0
    car.state.throttleInput = 0

    currentBrake = currentBrake + val
    currentBrake = Math.min(Math.max(currentBrake, 0), maxVal)
    car.state.brakeInput = currentBrake
  }

  function applyThrottle(val, maxVal=1){
    currentBrake = 0
    car.state.brakeInput = 0

    currentThrottle = currentThrottle + val
    currentThrottle = Math.min(Math.max(currentThrottle, 0), maxVal)
    car.state.throttleInput = currentThrottle
  }

  function applyThrottleForTargetSpeed(currentSpeed, targetSpeed, currentAcceleration){
    if(currentSpeed < targetSpeed && currentAcceleration < MAX_ACCELERATION ){
      applyThrottle(0.05)
    }
    if(currentSpeed > targetSpeed){
      applyThrottle(-0.05)
    }
  }

  function reduceThrottleGuess(currentThrottle, urgency, currentAcceleration){
    return currentThrottle - (0.3 + 0.2 * Math.random()) * urgency
  }

  function addThrottleGuess(currentThrottle, urgency, currentAcceleration){
    return currentThrottle + (0.3 + 0.2 * Math.random()) * urgency
  }

  function applyThrottleTo(throttleValue){
    if((currentThrottle + 0.01) < throttleValue){
      return applyThrottle(0.02)
    }
    if((currentThrottle - 0.01) > throttleValue){
      return applyThrottle(-0.02)
    }
  }

  function getThrottleToReachSpeed(targetSpeed, currentSpeed, currentThrottle, currentAcceleration, maxAcceleration=4){
    let throttleValue

    let accCurve = currentSpeed > targetSpeed ?
      createLinearCurve(currentSpeed, targetSpeed, -maxAcceleration, 0)
      : createLinearCurve(0, targetSpeed, maxAcceleration, 0)
    // let accCurve = createLinearCurve(0, targetSpeed, maxAcceleration, 0)
    let targetAcceleration = accCurve.getYForX(currentSpeed)

    if(currentAcceleration > targetAcceleration){
      throttleValue = reduceThrottleGuess(currentThrottle, 0.5, currentAcceleration)
    }

    if(currentAcceleration < targetAcceleration){
      throttleValue = addThrottleGuess(currentThrottle, 0.5, currentAcceleration)
    }

    return throttleValue
  }




  /**
   *
   *     User instruction
   *
   */

  function stopCar(){
    hasStopCarInstruction = true
    hasStopCarInstructionTime = time
  }


  return {
    think,
    stopCar,
    get frontCar() { return carInFront },
    get car() { return car },
    get currentTask() { return currentTask },
    get distance() { return getDistanceBetweenCar(carInFront.car, car)[1]},
    get TTC() { return carInFront ? getDistanceBetweenCar(carInFront.car, car)[1]/car.state.speed : null},
    get TTI() { return carInFront ? getDistanceBetweenCar(carInFront.car, car)[1]/Math.max((car.state.speed - carInFront.speed), 1) : null},
    get plannedSpeedCurve() { return plannedSpeedCurve}
  }
}


function createLinearCurve(fromX, toX, fromY, toY){
  if(fromX > toX){
    let tmpFromX = fromX
    fromX = toX
    toX = tmpFromX

    let tmpFromY = fromY
    fromY = toY
    toY = tmpFromY
  }
  return {
    getYForX(x){
      // if(x < fromX || x > toX) return null
      // if(x < fromX) return fromY
      if(x < fromX ) return fromY
      if(x > toX ) return toY
      let distTotalX = fromX - toX
      let distX = fromX - x
      let ratioX = (distX/distTotalX)
      let distTotalY = fromY - toY
      return fromY - ratioX * distTotalY
    }
  }
}

function detectCarInFront(car, cars){
  let nearestCar
  let nearestCarDistance = 10000
  let nearestCarDistanceBB = 10000
  for(var i = 0; i<cars.length; i++){
    if(cars[i].id === car.id) {
      continue
    }
    let [distanceToCar, distanceBB] = getDistanceBetweenCar(cars[i], car)
    // if(!nearestCar){
    //   nearestCar = cars[i]
    //   nearestCarDistance = distanceToCar
    //   continue
    // }
    if(distanceToCar > 0 && distanceToCar < nearestCarDistance){
      nearestCar = cars[i]
      nearestCarDistance = distanceToCar
      nearestCarDistanceBB = distanceBB
    }
  }
  return nearestCar ? {car: nearestCar, distance: nearestCarDistanceBB, speed : nearestCar.state.speed} : null
}

/**
 *
 * @param {CarEntity} firstCar
 * @param {CarEntity} secondCar
 * @returns
 */
function getDistanceBetweenCar(firstCar, secondCar){
  let distance = firstCar.state.position - secondCar.state.position
  let distanceBumperToBumper = distance - firstCar.props.length/2000 - secondCar.props.length/2000
  return [distance, distanceBumperToBumper]
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
