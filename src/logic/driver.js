import Utils from "./utils"

let uniqueId = 0

export default function Driver ({car, road, cruisingSpeed = 25}) {
  const id = uniqueId++

  let currentThrottle = 0
  let currentBrake = 0

  // following car behavior
  const anticipationDistance = 2
  const minDistance = 1
  let normalizedDistance = 0
  let desiredSpeed = 0

  let targetThrottle = {low:0, high:1}
  let targetEasing = 5 / 3.6
  let throttleIncidence = 1
  let previousThrottle = 0
  let previousAcc = null
  let previousSpeed = null

  let deccelerationCurve
  let accelerationCurve

  const bigBrainTicker = Utils.createTicker()

  function animate (t, dt) {
    const carState = car.getState()
    const carInFront = road.getObjectInFrontOf(car)
    
    // distance really gets meaning when its seen according to speed
    normalizedDistance = carInFront ? carInFront.distance / Math.max(carState.speed, 1) : null


    /**
     * 
     *  BIG Brain doing concious decisions
     * 
     */
    bigBrainTicker.tickInterval(1000, t, () => {
      // reacting to the car in front
      if(normalizedDistance < anticipationDistance 
        && normalizedDistance > 0 
        && carInFront.speed < carState.speed
      ){
        accelerationCurve = null
        deccelerationCurve = createLinearCurve(normalizedDistance, minDistance, carState.speed, carInFront.speed)
        return
      }
      if(deccelerationCurve){
        deccelerationCurve = null
        return
      }
      deccelerationCurve = null

      // going to cruising speed
      accelerationCurve = createLinearCurve(cruisingSpeed - targetEasing, cruisingSpeed, 1, 0)
    })

    /**
     * 
     * Small brain doing adjustement every animation ticks
     * 
     */
    if(deccelerationCurve){
      desiredSpeed = deccelerationCurve.getYForX(normalizedDistance) // getReachYForX
      // console.log(desiredSpeed)
      // release brake if under targetSpeed
      if(desiredSpeed > carState.speed){
        applyBrake(-0.02)
      }
      // apply brake
      if(desiredSpeed < carState.speed){
        applyBrake(0.02)
      }
    }

    if(accelerationCurve){
      let desiredAcc = accelerationCurve.getYForX(carState.speed)

      if(desiredAcc < carState.acceleration){
        if(currentThrottle < 0.01){
          applyBrake(0.01)
        }
        else {
          applyAccelerator(-0.01)
        }
      }
      if(desiredAcc > carState.acceleration){
        applyAccelerator(0.01)
      }
    }


    //   if(normalizedDistance < anticipationDistance && normalizedDistance > 0){
    //     if(!deccelerationCurve){
    //       deccelerationCurve = createLinearCurve(normalizedDistance, minDistance, carState.speed, carInFront.speed)
    //     }
    //     let desiredSpeed = deccelerationCurve.getYForX(normalizedDistance) // getReachYForX
    //     // release brake if under targetSpeed
    //     if(desiredSpeed > carState.speed){
    //       applyBrake(-0.02)
    //     }
    //     // apply brake
    //     if(desiredSpeed < carState.speed){
    //       applyBrake(0.02)
    //     }
    //     return
    //   }
    // }
    
    // deccelerationCurve = null


    // let isInEasingZone = Math.abs(cruisingSpeed - carState.speed) < targetEasing

    // if(isInEasingZone){
    //   if(!accelerationCurve){
    //     accelerationCurve = createLinearCurve(cruisingSpeed - targetEasing, cruisingSpeed, 1, 0)
    //   }
    //   let desiredAcc = accelerationCurve.getYForX(carState.speed)
    //   if(desiredAcc < carState.acceleration){
    //     applyAccelerator(-0.01)
    //   }
    //   if(desiredAcc > carState.acceleration){
    //     applyAccelerator(0.01)
    //   }
    // }
    // else if (carState.speed < cruisingSpeed){
    //   accelerationCurve = null
    //   applyAccelerator(0.01)
    // }
    // else {
    //   if(currentThrottle < 0.01){
    //     applyBrake(0.01)
    //   }
    //   else {
    //     applyAccelerator(-0.01)
    //   }
    // }
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

  function getState(){
    return {
      normalizedDistance,
      desiredSpeed,
    }
  }

  return {
    id,
    animate,
    getState,
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