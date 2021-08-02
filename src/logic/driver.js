import * as Car from "./car"

var id=0

export function create (car) {
  return {
    id : id++,
    car : car,

    targetSpeed : 90,
    currentThrottle : 0,
    targetThrottle : {low:0, high:1},
    targetEasing : 5,
    throttleIncidence : 1,
    previousThrottle : 0,
    previousAcc : null,
    previousSpeed : null,
  }
}

export function animate (driver, t, dt) {
  let carState = driver.car.state
  let {targetSpeed, targetEasing, throttleIncidence, previousThrottle, currentThrottle, previousAcc, previousSpeed} = driver 

  let isAcclerating = carState.acceleration > 0
  let distToTargetSpeed = targetSpeed - carState.speed
  let distToTargetSpeedRatio = distToTargetSpeed / targetEasing
  let distToTargetAcc = 0 - carState.acceleration
  let distToTargetAccRatio = distToTargetAcc / carState.acceleration

  throttleIncidence = getThrottleIncidence(previousThrottle, currentThrottle, previousAcc, carState.acceleration) ?? throttleIncidence
  
  previousThrottle = currentThrottle

  if(distToTargetSpeedRatio < -1){
    currentThrottle = 0
  }
  else if(distToTargetSpeedRatio < 1){
    // let targetAcc = getCurve(previousSpeed, targetSpeed, carState.acceleration, 0, 'easingtoTarget')
    let deltaSpeed = Math.abs(previousSpeed - carState.speed)
    let curveRatio = deltaSpeed / Math.abs(previousSpeed - targetSpeed)
    let targetAcc = curveRatio * carState.acceleration
    currentThrottle -= targetAcc * throttleIncidence
  }
  else {
    currentThrottle = 1
  }

  currentThrottle = Math.max(Math.min(currentThrottle, 1), 0)

  previousAcc = carState.acceleration
  previousSpeed = carState.speed
  Car.accelerate(driver.car, currentThrottle)
  Object.assign(driver, {
    previousAcc, previousSpeed, throttleIncidence, currentThrottle, previousThrottle
  })
}

function getThrottleIncidence(previousThrottle, currentThrottle, previousAcc, currentAcc){
  if(!previousThrottle || previousThrottle === currentThrottle){
    return null
  }

  let deltaThrottle = currentThrottle - previousThrottle
  let deltaAcc = currentAcc - previousAcc
  let rThrottle = 1 / deltaThrottle
  return deltaAcc * rThrottle 
}

function getCurve(fromSpeed, toSpeed, fromAcc, toAcc) {

}