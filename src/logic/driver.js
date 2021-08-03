let uniqueId = 0

export default function Driver ({car, road, targetSpeed = 90}) {
  const id = uniqueId++

  let currentThrottle = 0
  let targetThrottle = {low:0, high:1}
  let targetEasing = 5
  let throttleIncidence = 1
  let previousThrottle = 0
  let previousAcc = null
  let previousSpeed = null

  function animate (t, dt) {
    let carState = car.getState()

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
    car.accelerate(currentThrottle)
  }

  return {
    animate
  }
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