let uniqueId = 0

export default function Driver ({car, road, targetSpeed = 90}) { // TODO targetSpeed to cruising speed
  const id = uniqueId++

  let currentThrottle = 0
  let currentBrake = 0

  let targetThrottle = {low:0, high:1}
  let targetEasing = 5
  let throttleIncidence = 1
  let previousThrottle = 0
  let previousAcc = null
  let previousSpeed = null

  let deccelerationCurve

  function animate (t, dt) {
    let carState = car.getState()

    
    // return car.brake(1)
    
    let carInFront = road.getObjectInFrontOf(car)
    if(carInFront) {
      let speedDiff = carState.speed - carInFront.speed
      let distanceInSeconds = carInFront.distance / carState.speed

      const anticipationDistance = 3
      const minDistance = 1
      // console.log('distanceInSeconds',distanceInSeconds)
      if(distanceInSeconds < anticipationDistance && distanceInSeconds > 0){
        if(!deccelerationCurve){
          deccelerationCurve = createDeccelerationCurve(distanceInSeconds, minDistance, carState.speed, carInFront.speed)
        }
        let desiredSpeed = deccelerationCurve.getYForX(distanceInSeconds)
        // release brake if under targetSpeed
        if(desiredSpeed > carState.speed){
          applyBrake(-0.02)
        }
        // apply brake
        if(desiredSpeed < carState.speed){
          applyBrake(0.02)
        }
        // currentThrottle = 0
        // return car.brake(currentBrake)
        // return car.accelerate(currentThrottle)
        return
      }
    }

    let distToTargetSpeed = targetSpeed - carState.speed
    let distToTargetSpeedRatio = distToTargetSpeed / targetEasing

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

  function applyBrake(val){
    currentBrake = currentBrake + val
    currentBrake = Math.min(Math.max(currentBrake, 0), 1)
    currentThrottle = 0
    car.brake(currentBrake)
  }

  return {
    animate
  }
}

function createDeccelerationCurve(fromX, toX, fromY, toY){
  return {
    getYForX(x){
      let distTotalX = fromX - toX
      let distX = fromX - x
      let ratioX = (distTotalX/distX)
      let distTotalY = fromY - toY
      return fromY - ratioX * distTotalY
    }
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