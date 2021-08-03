let uniqueId = 0

export default function Car ({speed = 0}) {  
  // car props
  const id = uniqueId++
  const name = 'zoe'
  const revRatio = 83 // ratio (engine revolution / speed km/h)
  const torqueCurve = [
    [0*revRatio,190], 
    [7*revRatio,220], 
    [33*revRatio,220], 
    [50*revRatio,150], 
    [70*revRatio,105], 
    [90*revRatio, 80], 
    [110*revRatio, 65], 
    [135*revRatio, 52], 
    [200*revRatio, 30]
  ]
  const gearRatio = 1
  const weight = 1468
  const length = 4084
  const width = 1730
  const height = 1562
  const dragCoef = 0.29 // cd
  const dragArea = 2.1

  // car state
  const state = {
    speed : speed, // Km/h
    rpm : speed * revRatio,
    throttle : 0,
    power : 0, // Kw
    torque : 0, 
    force : 0,
    acceleration : 0,
    airDrag : 0,
  }



  /**
   * Adjust car accelerator
   * @param {number} throttleRatio 0.0 to 1.0
   */
  function accelerate (throttleRatio) {
    state.throttle = Math.max(Math.min(throttleRatio, 1), 0)
  }

  /**
   * 
   * @param {*} t 
   * @param {*} dtms delta time in ms since last tick
   */
  function animate (t, dtms) {
    const coefWheelDrag = 0.25
    const gravity = 10

    // wheel drag force
    let wheelDrag = weight * coefWheelDrag // * Math.min(Math.abs(state.speed), 1)
    let airDrag = getAirDragForce(state.speed/3.6, dragCoef, dragArea)

    // allow drive from a standstill
    let rpm = Math.max(state.rpm, 50)

    let torque = getTorqueForRPM(torqueCurve, rpm) * state.throttle
    let power = torqueToKW(torque, rpm)

    const dt = dtms / 1000 // dt in seconds

    // calculate acceleration
    const mass = weight
    let distance = (Math.max(state.speed, 3.6) / 3.6) * dt
    let work = power * 1000 * dt
    let force = work / distance
    let acceleration = (force - airDrag - wheelDrag) / mass
    let deltaV = acceleration * dt

    // update state
    state.speed += deltaV ? deltaV * 3.6 : 0
    state.rpm = state.speed * revRatio
    Object.assign(state, {acceleration, force, airDrag, torque, power})
  }

  function getState() {
    return state
  }

  return {
    accelerate,
    animate,
    getState,
  }
}

/*-----------------

      Helpers

-----------------*/
function torqueToKW(torque, rpm){
  if(torque === null || !rpm){ return null }
  return (torque * rpm) / 9549
}

/**
 * https://www.engineeringtoolbox.com/drag-coefficient-d_627.html
 * Fd = 1/2 ρ v2 cd A                      
 * where
 * Fd = drag force (N)
 * ρ = density of fluid (1.2 kg/m3 for air at NTP)
 * v = flow velocity (m/s)
 * cd = drag coefficient
 * A = characteristic frontal area of the body  (m2)
 * 
 * @param {number} speed m/s
 * @param {number} dragCoef
 * @param {number} dragArea m2
 * 
 * @return {number} Force (N)
 */
function getAirDragForce(speed, dragCoef, dragArea){
  const rho = 1.2
  let airDrag = 0.5 * rho * Math.pow(speed, 2) * dragCoef * dragArea 
  return airDrag
}

/**
 * Get Torque for any RPM
 * Assuming the torqueCurve is of the form
 * [[rpm, torque],[rpm, torque],...]
 * (Interpolate curve)
 * @param {number[][]} torqueCurve
 * @param {number} rpm 
 * @returns {number}
 */
function getTorqueForRPM (torqueCurve, rpm) {
  var torque = torqueCurve.find((torque) => {
    return torque[0] === rpm
  })
  if(torque){
    return torque[1]
  }

  var indexHigherRPM = torqueCurve.findIndex((torque) => {
    return torque[0] > rpm
  })
  // not found or first torque point was higher,
  // meaning the wanted rpm is before the torque curve if 0 or after if -1
  if (indexHigherRPM <= 0) {
    return null
  }
  var prevTorquePoint = torqueCurve[indexHigherRPM - 1]
  var nextTorquePoint = torqueCurve[indexHigherRPM]

  var distRPM = nextTorquePoint[0] - prevTorquePoint[0]
  var distPercent = (rpm - prevTorquePoint[0]) / distRPM
  var distTorque = nextTorquePoint[1] - prevTorquePoint[1]
  return prevTorquePoint[1] + distTorque * distPercent
}