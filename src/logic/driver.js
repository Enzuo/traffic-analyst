let uniqueId = 0

export default function Driver ({car, road, cruisingSpeed = 25}) {
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
  let accelerationCurve

  function animate (t, dt) {
    let carState = car.getState()


    let carInFront = road.getObjectInFrontOf(car)
    if(carInFront) {
      let speedDiff = carState.speed - carInFront.speed
      let distanceInSeconds = carInFront.distance / carState.speed

      const anticipationDistance = 3
      const minDistance = 1
      if(distanceInSeconds < anticipationDistance && distanceInSeconds > 0){
        if(!deccelerationCurve){
          deccelerationCurve = createLinearCurve(distanceInSeconds, minDistance, carState.speed, carInFront.speed)
        }
        let desiredSpeed = deccelerationCurve.getYForX(distanceInSeconds) // getReachYForX
        // release brake if under targetSpeed
        if(desiredSpeed > carState.speed){
          applyBrake(-0.02)
        }
        // apply brake
        if(desiredSpeed < carState.speed){
          applyBrake(0.02)
        }
        return
      }
    }
    
    deccelerationCurve = null


    let isInEasingZone = (cruisingSpeed - carState.speed) < targetEasing

    if(isInEasingZone){
      if(!accelerationCurve){
        accelerationCurve = createLinearCurve(cruisingSpeed - targetEasing, cruisingSpeed, carState.acceleration, 0)
      }
      let desiredAcc = accelerationCurve.getYForX(carState.speed)
      if(desiredAcc < carState.acceleration){
        applyAccelerator(-0.01)
      }
      if(desiredAcc > carState.acceleration){
        applyAccelerator(0.01)
      }
    }
    else {
      accelerationCurve = null
      applyAccelerator(0.01)
    }

    // if(distToCrusingSpeedRatio < -1){
    //   applyAccelerator(-0.02)
    // }
    // else if(distToCrusingSpeedRatio < 1){
    //   applyAccelerator(-0.01)
    // }
    // else{
    //   applyAccelerator(0.01)
    // }

    // let distToTargetSpeed = cruisingSpeed - carState.speed
    // let distToTargetSpeedRatio = distToTargetSpeed / targetEasing

    // throttleIncidence = getThrottleIncidence(previousThrottle, currentThrottle, previousAcc, carState.acceleration) ?? throttleIncidence
    
    // previousThrottle = currentThrottle

    // if(distToTargetSpeedRatio < -1){
    //   currentThrottle = 0
    // }
    // else if(distToTargetSpeedRatio < 1){
    //   // let targetAcc = getCurve(previousSpeed, targetSpeed, carState.acceleration, 0, 'easingtoTarget')
    //   let deltaSpeed = Math.abs(previousSpeed - carState.speed)
    //   let curveRatio = deltaSpeed / Math.abs(previousSpeed - cruisingSpeed)
    //   let targetAcc = curveRatio * carState.acceleration
    //   currentThrottle -= targetAcc * throttleIncidence
    // }
    // else {
    //   currentThrottle = 1
    // }

    // currentThrottle = Math.max(Math.min(currentThrottle, 1), 0)

    // previousAcc = carState.acceleration
    // previousSpeed = carState.speed
    // applyAccelerator(currentThrottle)
  }

  function applyBrake(val){
    currentThrottle = 0

    currentBrake = currentBrake + val
    currentBrake = Math.min(Math.max(currentBrake, 0), 1)
    car.brake(currentBrake)
  }

  function applyAccelerator(val){
    currentBrake = 0
    
    currentThrottle = currentThrottle + val
    currentThrottle = Math.min(Math.max(currentThrottle, 0), 1)
    car.accelerate(currentThrottle)
  }

  return {
    animate
  }
}

function createLinearCurve(fromX, toX, fromY, toY){
  return {
    getYForX(x){
      let distTotalX = fromX - toX
      let distX = fromX - x
      let ratioX = (distX/distTotalX)
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