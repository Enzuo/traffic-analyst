import {
  getAirDragForce, 
  getRollingResistanceForce, 
  getEngineForceFromTorque, 
  getTransmissionEfficiency,
  getEngineForceFromPower,
  getTorqueForRPM, 
  torqueToKW, 
  getEngineRPMForSpeed
} from './physics'

let uniqueId = 0

/**
 * @typedef {import('../cardata').Car} Car
 * @typedef {object} CarEntity 
 */
/**
 * 
 * @param {Car} props 
 * @returns {CarEntity}
 */

export function createCarEntity(props){
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

/**
 * 
 * @param {CarEntity} car 
 * @param {number} dt {ms} time elapsed
 * @returns 
 */
export function updateForces(car, dt){
  let dts = dt/1000
  // const coefWheelDrag = 0.0025
  const gravity = 9.81
  const {engine, gearRatio, driveRatio, gearSpeed, gearTransfer, weight, dragCoef, dragArea, brakePadsForce, wheelDiameter} = car.props
  const {speed, engineRpm, throttleInput, brakeInput, gearInput} = car.state

  // wheel drag force
  let slope = 0

  let rollingResistanceForce = getRollingResistanceForce(speed, car.state.acceleration, weight)
  let aeroDragForce = getAirDragForce(speed, dragCoef * dragArea)

  let torque = getTorqueForRPM(engine.torqueCurve, engineRpm) * throttleInput
  let power = torqueToKW(torque, engineRpm)

  // brake
  let brakeForce = brakeInput * brakePadsForce

  // calculate acceleration
  const mass = weight

  // let transmissionEfficiency = getTransmissionEfficiency(gearRatio[gearInput])
  // let thrustForce = getEngineForceFromPower(speed, power, dts) * transmissionEfficiency
  let finalRatio = driveRatio * gearRatio[gearInput] * (gearTransfer ? gearTransfer[0] : 1)
  let thrustForce = getEngineForceFromTorque(torque, finalRatio, null, wheelDiameter)

  let acceleration = (thrustForce - aeroDragForce - rollingResistanceForce - brakeForce) / mass
  let deltaV = acceleration * dts

  let currentGearSpeed = gearRatio[gearRatio.length-1] / gearRatio[gearInput] * gearSpeed
  let minRPM = engine.minRPM || 1000
  let rpmForSpeed = Math.max(getEngineRPMForSpeed(speed, finalRatio, wheelDiameter), minRPM)

  let newState = {
    speed : speed + (deltaV ? deltaV : 0),
    engineRpm : rpmForSpeed,
    acceleration, thrustForce, aeroDragForce, torque, power
  }

  // console.log(force,airDrag,wheelDrag,brakeForce)

  return Object.assign(car, { state : Object.assign(car.state, newState)})
}
