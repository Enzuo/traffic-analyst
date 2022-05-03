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
      gearInput : 0,
    }
  }
}


export function updateForces(car, dt){
  let dts = dt/1000
  // const coefWheelDrag = 0.0025
  const gravity = 9.81
  const {engine, gearRatio, driveRatio, gearSpeed, weight, dragCoef, dragArea, brakePadsForce} = car.props
  const {speed, engineRpm, throttleInput, brakeInput, gearInput} = car.state

  // wheel drag force
  let slope = 0

  // TODO add acceleration slip, depending on acceleration of the car tire will sleep increasing rolling resistance up to 200%
  // const tirePressure = 2.5
  // let coefWheelDrag = 0.005 + (1 / tirePressure) * (0.01 + 0.0095 * Math.pow((speed / 28), 2))    
  // let accelerationSlip = 

  let coefWheelDrag = 0.03   
  let rollingResistanceForce = weight * gravity * coefWheelDrag// * Math.min(Math.abs(state.speed), 1) 
  let aeroDragForce = getAirDragForce(speed, dragCoef, dragArea)

  let torque = getTorqueForRPM(engine.torqueCurve, engineRpm) * throttleInput
  let power = torqueToKW(torque, engineRpm)

  // brake
  let brakeForce = brakeInput * brakePadsForce

  // calculate acceleration
  const mass = weight

  // let distance = (Math.max(speed, 1)) * dts // min speed of 1m/s
  // let work = power * 1000 * dts
  // let force = work / distance
  // let acceleration = (force - aeroDragForce - rollingResistanceForce - brakeForce) / mass
  // let deltaV = acceleration * dts

  let transmissionEfficiency = gearRatio[gearInput] > 1 ? 0.85 : 0.9
  let torqueAtWheel = torque * transmissionEfficiency * driveRatio * gearRatio[gearInput]
  let wheelRadius = 0.31
  let forceAtWheel = torqueAtWheel / wheelRadius
  let acceleration = (forceAtWheel - aeroDragForce - rollingResistanceForce - brakeForce) / mass
  let deltaV = acceleration * dts

  let currentGearSpeed = gearRatio[gearRatio.length-1] / gearRatio[gearInput] * gearSpeed
  let minRPM = engine.minRPM || 1000
  let rpmForSpeed = getEngineRpmForSpeed(speed, currentGearSpeed, minRPM)

  let newState = {
    speed : speed + (deltaV ? deltaV : 0),
    engineRpm : rpmForSpeed,
    acceleration, forceAtWheel, aeroDragForce, torque, power
  }

  // console.log(force,airDrag,wheelDrag,brakeForce)

  return Object.assign(car, { state : Object.assign(car.state, newState)})
}

/**
 * 
 * @param {number} speed m/s
 * @param {number} speedForGear km/h at 1000rpm
 * @param {number} minRpm 
 */
function getEngineRpmForSpeed(speed, speedForGear, minRpm){
  let rpm = speed / (speedForGear/3.6/1000)
  return Math.max(rpm, minRpm)
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
  let SCx = dragCoef * dragArea 
  let airDrag = 0.5 * rho * Math.pow(speed, 2) * SCx
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