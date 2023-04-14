/**
 * 
 * @param {number} speed m/s
 * @param {number} speedForGear km/h at 1000rpm
 * @param {number} minRpm 
 */
export function getEngineRpmForSpeed(speed, speedForGear, minRpm=0){
  let rpm = speed / (speedForGear/3.6/1000)
  return Math.max(rpm, minRpm)
}

/**
 * 
 * @param {number} speed {m/s}
 * @param {number} ratio between engine rpm and wheel rpm (gearRatio * transferRatio (H-L) * driveRatio)
 * @param {number} wheelDiameter {cm} wheel diameter
 */
export function getEngineRPMForSpeed(speed, ratio, wheelDiameter = 63){
  const wheelRPS = speed / (wheelDiameter/100 * Math.PI)
  const engineRPS = wheelRPS * ratio
  const engineRPM =  engineRPS * 60
  return engineRPM
}


export function getSpeedForRPM(rpm, gearRatio, driveRatio, wheelDiameter = 63){
  let rps = rpm/60
  let axleRps = rps/(gearRatio * driveRatio)
  let speed = axleRps * (wheelDiameter/100 * Math.PI)
  return speed
}

/**
 * 
 * @param {number} gearRatio 
 * @param {*} gearBoxType 
 * @returns {number} efficiency ratio between 0 and 1
 */
export function getTransmissionEfficiency(gearRatio, gearBoxType){
  return gearRatio >= 1 ? 0.85 : 0.96
}

/**
 * 
 * @param {number} speed  m/s
 * @param {number} power kw
 * @param {number} dts s
 * @returns {number} Force (N)
 */
export function getEngineForceFromPower(speed, power, dts){
  let distance = (Math.max(speed, 1)) * dts // min speed of 1m/s
  let work = power * 1000 * dts
  let force = work / distance
  return force
}

/**
 * 
 * @param {number} speed m/s
 * @param {number} acceleration m/s²
 * @param {number} weight kg
 * @returns {number} Force (N)
 */
export function getRollingResistanceForce(speed, acceleration, weight){
  const gravity = 9.81
  const tirePressure = 2.5
  let coefWheelDrag = 0.005 + (1 / tirePressure) * (0.01 + 0.0095 * Math.pow((speed / 28), 2))    
  
  // Depending on acceleration, tires will slip which can look like an increase in rolling resistance up to 200%
  // For example, for pneumatic tires, a 5% slip can translate into a 200% increase in rolling resistance.
  // When the tractive force is about 40% of the maximum traction, the slip resistance is almost equal to the basic rolling resistance
  // At high torques, which apply a tangential force to the road of about half the weight of the vehicle, the rolling resistance may triple (a 200% increase).
  let tireSlip = 1 + acceleration * 0.4

  let rollingResistanceForce = weight * gravity * coefWheelDrag * tireSlip
  return rollingResistanceForce
}


/**
 * 
 * @param {number} speed m/s
 * @param {number} wheelDiameter cm
 * @returns turns/s
 */
export function getWheelTurns(speed, wheelDiameter = 63){
  let wheelPerimeter = (wheelDiameter/100) * Math.PI
  return speed / wheelPerimeter
}


/**
 * 
 * @param {number} speed m/s 
 * @param {number} weight kg 
 * @param {number} scx Cx . surface
 * @returns N
 */
export function getResistanceForceAtSpeed(speed, weight, scx){
  let rollingResistanceForce = getRollingResistanceForce(speed, 0, weight)
  let airDragForce = getAirDragForce(speed, scx)
  return (rollingResistanceForce + airDragForce)
}

/**
 * 
 * @param {number} speed m/s 
 * @param {number} weight kg 
 * @param {number} scx Cx . surface
 * @returns kw
 */
export function getPowerRequiredForSpeed(speed, weight, scx){
  let resistanceForce = getResistanceForceAtSpeed(speed, weight, scx)
  let transmissionEfficiency = getTransmissionEfficiency(1)
  let work = speed * ((resistanceForce) / transmissionEfficiency)
  return work / 1000
}

/**
 * 
 * @param {number} torque {nm} engine torque
 * @param {number} finalRatio ratio between engine rotation and wheels rotation
 * @param {number} efficiency typically between 0.86 - 0.94
 * @param {number} wheelDiameter {cm}
 * @returns {number} Force {N}
 */
export function getEngineForceFromTorque(torque, finalRatio, efficiency, wheelDiameter = 63){
  if(!torque) return null
  let transmissionEfficiency = efficiency || mockEfficiency(finalRatio) // getTransmissionEfficiency(gearRatio)
  let torqueAtWheel = torque * transmissionEfficiency * finalRatio
  let wheelRadius = (wheelDiameter/100)/2
  let forceAtWheel = torqueAtWheel / wheelRadius
  return forceAtWheel
}

function mockEfficiency(finalRatio){
  const highBound = 20
  const lowBound = 5
  const lowEfficiency = 0.85
  const highEfficiency = 0.96
  let r = (highEfficiency - lowEfficiency) / (highBound - lowBound)
  let e = (finalRatio - lowBound) * r
  return highEfficiency - e
}

/**
 * 
 * @param {number} torque Nm
 * @param {number} rpm 
 * @returns {number} kw
 */
export function torqueToKW(torque, rpm){
  if(torque === null){ return null }
  if(!rpm){ return 0 }
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
 * @param {number} SCx Cx . Surface
 * 
 * @return {number} Force (N)
 */
export function getAirDragForce(speed, SCx){
  const rho = 1.2
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
 * @returns {number} Nm
 */
export function getTorqueForRPM (torqueCurve, rpm) {
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