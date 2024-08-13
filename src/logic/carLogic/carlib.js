/**
 *               _____ _           _
 *              |  _  | |_ _ _ ___|_|___ ___
 *              |   __|   | | |_ -| |  _|_ -|
 *              |__|  |_|_|_  |___|_|___|___|
 *                        |___|
 *
 * Standalone file describing the various physics calculations involved with cars
 *
 */


/**
 *
 * @param {number} speed m/s
 * @param {number} speedForGear km/h at 1000rpm
 * @param {number} minRpm
 */
export function getEngineRpmForSpeedFromGearSpeed(speed, speedForGear, minRpm=0){
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
  return Math.max(highEfficiency - e, lowEfficiency)
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

export function KWToTorque(power, rpm){
  return (power * 9549) / rpm
}

export function HpToKW(power){
  return 0.73549875 * power
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
 * @param {number} maxPower max engine output power in kw
 * @returns {number} Nm
 */
export function getTorqueForRPM (torqueCurve, rpm, maxPower) {
  var torque = torqueCurve.find((tcpoint) => {
    return tcpoint[0] === rpm
  })
  if(torque){
    return torque[1]
  }

  var indexHigherRPM = torqueCurve.findIndex((tcpoint) => {
    return tcpoint[0] > rpm
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

  var torqueValue = prevTorquePoint[1] + distTorque * distPercent
  if(maxPower && torqueToKW(torqueValue, rpm) > maxPower ){
    torqueValue = KWToTorque(maxPower, rpm)
  }
  return torqueValue
}


/**
 *
 * @param {string} specString ex: 100nm@1500 60hp@4000
 * @param {string|number} idleRpm 1000
 * @returns {number[][]} torqueCurve
 */
export function parseEngineSpec(specString, idleRpm=1000) {
  if(typeof idleRpm === 'string'){
    idleRpm = parseInt(idleRpm)
  }
  let maxTorque = 0
  const regex = /(\d+)(\w+)@(\d+)/ig
  const values = [...specString.matchAll(regex)]
  const torqueCurve = values.map(v => {
    const val = parseFloat(v[1])
    const unit = v[2]
    const rpm = parseInt(v[3])
    let torque = val

    if(/hp/.test(unit)){
      torque = KWToTorque(HpToKW(val), rpm)
    }

    if(/kw/.test(unit)){
      torque = KWToTorque(val, rpm)
    }

    maxTorque = Math.max(maxTorque, torque)
    return [rpm, torque]
  })
  if(torqueCurve.length && torqueCurve[0][0] > idleRpm){
    const idleTorqueX = 0.7
    torqueCurve.unshift([idleRpm, maxTorque * idleTorqueX ])
  }

  return torqueCurve
}


/**
 * convert from one unit of a category to another
 * @param {number|string} value
 * @param {string=} unit unit to convert to (default if not provided)
 * @param {string=} fromUnit value is expressed using this unit (useful if value is a number not expressed in default unit)
 * @returns
 */
export function convertQty(value, unit, fromUnit){
  if(typeof value === 'string'){
    const match = value.match(/(\d+\.*\d+)(\D*)/);
    fromUnit = match[2]
    value = parseFloat(match[1])
  }

  if(!unit && !fromUnit){
    return {
      value,
      unit : '?',
    }
  }

  // TODO use a conversion table ex: [kw, hp, 0,7][nm, lbft, 1.2]
  // Find dimension we want to work with
  // let dimension = conversionTable.find(
  //   dim => dim.some(
  //     i => typeof i === 'string' && (new RegExp(`^${fromUnit}$`, 'i').test(i) || new RegExp(`^${unit}$`, 'i').test(i))
  // ))

  // Find dimension & ratios we want to work with
  let ratios
  let i=0
  while(!ratios && i < conversionTable.length) {
    ratios = findRatiosForUnits(conversionTable[i], unit, fromUnit)
    i++
  }

  console.log('got ratios', ratios, 'for ', value, unit, fromUnit)

  function findRatiosForUnits(dimension, toUnit, fromUnit){
    let toUnitRatio
    let fromUnitRatio
    for(var i=0; i < dimension.length; i++){
      var k = dimension[i]
      if(typeof k === 'number'){
        continue
      }
      if(toUnit){
        if(!toUnitRatio && new RegExp(`^${toUnit}$`, 'i').test(k)){
          // first unit is default unit and has a ratio of 1 (with itself)
          if(i===0){
            toUnitRatio = 1
          }
          else {
            toUnitRatio = dimension[i+1]
          }
        }
      }
      else {
        console.log('default toUnit', toUnit)
        toUnit = dimension[0]
        toUnitRatio = 1
      }
      if(fromUnit){
        if(!fromUnitRatio && new RegExp(`^${fromUnit}$`, 'i').test(k)){
          // first unit is default unit and has a ratio of 1 (with itself)
          if(i===0){
            fromUnitRatio = 1
          }
          else {
            fromUnitRatio = dimension[i+1]
          }
        }
      }
      else {
        console.log('default fromUnit', fromUnit)
        fromUnit = dimension[0]
        fromUnitRatio = 1
      }

      // if fromUnitRatio also found
      if(toUnitRatio && fromUnitRatio){
        return {
          toUnit,
          toUnitRatio,
          fromUnit,
          fromUnitRatio,
        }
      }
    }
    return null
  }

  // convert with ratios
  value = value / ratios.fromUnitRatio * ratios.toUnitRatio
  console.log('final value', value, ratios.toUnit)

  return {
    value,
    unit : ratios.toUnit
  }
}

const conversionTable = [
  ['kw', 'hp', 1.341,'bhp', 1.3596],
  ['nm', 'ftlb', 0.7376],
]