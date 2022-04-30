let uniqueId = 0


export function create(props){
  return {
    id: uniqueId++,
    props,
    state:{
      speed : 0, // m/s
      engineRpm : 0,
      enginePower : 0, // Kw
      engineTorque : 0, 
      force : 0,
      acceleration : 0,
      airDrag : 0,  
      throttleInput : 0,
      brakeInput : 0,
    }
  }
}


export function updateForces(car, dt){
  let dts = dt/1000
  const coefWheelDrag = 0.25
  const gravity = 10
  const {engine, gearSpeed, weight, dragCoef, dragArea, brakePadsForce} = car.props
  const {speed, engineRpm, throttleInput, brakeInput} = car.state

  // wheel drag force
  let wheelDrag = weight * coefWheelDrag // * Math.min(Math.abs(state.speed), 1)
  let airDrag = getAirDragForce(speed, dragCoef, dragArea)

  

  let torque = getTorqueForRPM(engine.torqueCurve, Math.max(engineRpm,50)) * throttleInput
  let power = torqueToKW(torque, Math.max(engineRpm, 50))

  // brake
  let brakeForce = brakeInput * brakePadsForce

  // calculate acceleration
  const mass = weight
  let distance = (Math.max(speed, 1)) * dts // min speed of 1m/s
  let work = power * 1000 * dts
  let force = work / distance
  let acceleration = (force - airDrag - wheelDrag - brakeForce) / mass
  let deltaV = acceleration * dts

  var rpmForSpeed = speed / 
            (1 / 1 * // gearRatioFor gearSpeed / gearRatio
              (gearSpeed/3.6) / 1000);


  let newState = {
    speed : speed + (deltaV ? deltaV : 0),
    engineRpm : rpmForSpeed,
    acceleration, force, airDrag, torque, power
  }

  // console.log(force,airDrag,wheelDrag,brakeForce)

  return Object.assign(car, { state : Object.assign(car.state, newState)})
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