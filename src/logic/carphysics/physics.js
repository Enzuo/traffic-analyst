/**
 * 
 * @param {number} speed m/s
 * @param {number} speedForGear km/h at 1000rpm
 * @param {number} minRpm 
 */
export function getEngineRpmForSpeed(speed, speedForGear, minRpm){
  let rpm = speed / (speedForGear/3.6/1000)
  return Math.max(rpm, minRpm)
}

/**
 * 
 * @param {number} speed  m/s
 * @param {number} power kw
 * @param {number} dts s
 * @returns 
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
 * @returns 
 */
export function getRollingResistanceForce(speed, acceleration, weight){
  const gravity = 9.81
  const tirePressure = 2.5
  let coefWheelDrag = 0.005 + (1 / tirePressure) * (0.01 + 0.0095 * Math.pow((speed / 28), 2))    
  // Depending on acceleration, tires will slip which can look like an increase in rolling resistance up to 200%
  let tireSlip = 1 + acceleration * 0.3

  let rollingResistanceForce = weight * gravity * coefWheelDrag * tireSlip
  return rollingResistanceForce
}

/**
 * 
 * @param {number} speed m/s 
 * @param {number} weight kg 
 * @param {number} scx Cx . surface
 * @returns kw
 */
export function getPowerForSpeed(speed, weight, scx){
  console.log(speed, weight, scx)
  let rollingResistanceForce = getRollingResistanceForce(speed, 0, weight)
  let airDragForce = getAirDragForce(speed, scx)
  let work = speed * (rollingResistanceForce + airDragForce)
  return work / 1000
}

/**
 * 
 * @param {number} torque nm
 * @param {number} driveRatio 
 * @param {number} gearRatio 
 * @param {number} wheelDiameter cm
 * @returns 
 */
export function getEngineForceFromTorque(torque, driveRatio, gearRatio, wheelDiameter = 63){
  let transmissionEfficiency = gearRatio > 1 ? 0.85 : 0.9
  let torqueAtWheel = torque * transmissionEfficiency * driveRatio * gearRatio
  let wheelRadius = (wheelDiameter/100)/2
  let forceAtWheel = torqueAtWheel / wheelRadius
  return forceAtWheel
}

export function torqueToKW(torque, rpm){
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
 * @returns {number}
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