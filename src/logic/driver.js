let uniqueId = 0

export default function Driver ({car, road, cruisingSpeed = 25}) {
  const id = uniqueId++

  let currentThrottle = 0
  let currentBrake = 0

  let targetThrottle = {low:0, high:1}
  let targetEasing = 5 / 3.6
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
      // distance really matters when its seen according to speed
      let normalizedDistance = carInFront.distance / Math.max(carState.speed, 1)

      const anticipationDistance = 3
      const minDistance = 1
      if(normalizedDistance < anticipationDistance && normalizedDistance > 0){
        if(!deccelerationCurve){
          deccelerationCurve = createLinearCurve(normalizedDistance, minDistance, carState.speed, carInFront.speed)
        }
        let desiredSpeed = deccelerationCurve.getYForX(normalizedDistance) // getReachYForX
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


    let isInEasingZone = Math.abs(cruisingSpeed - carState.speed) < targetEasing

    if(isInEasingZone){
      if(!accelerationCurve){
        accelerationCurve = createLinearCurve(cruisingSpeed - targetEasing, cruisingSpeed, 1, 0)
      }
      let desiredAcc = accelerationCurve.getYForX(carState.speed)
      if(desiredAcc < carState.acceleration){
        applyAccelerator(-0.01)
      }
      if(desiredAcc > carState.acceleration){
        applyAccelerator(0.01)
      }
    }
    else if (carState.speed < cruisingSpeed){
      accelerationCurve = null
      applyAccelerator(0.01)
    }
    else {
      if(currentThrottle < 0.01){
        applyBrake(0.01)
      }
      else {
        applyAccelerator(-0.01)
      }
    }
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