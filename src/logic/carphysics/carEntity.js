import {
  getAirDragForce, 
  getRollingResistanceForce, 
  getEngineForceFromTorque, 
  getTorqueForRPM, 
  torqueToKW, 
  getEngineRpmForSpeed
} from './physics'

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
  const {engine, gearRatio, driveRatio, gearSpeed, weight, dragCoef, dragArea, brakePadsForce, wheelDiameter} = car.props
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

  // let transmissionEfficiency = gearRatio[gearInput] > 1 ? 0.85 : 0.9
  // let thrustForce = getEngineForceFromPower(speed, power, dts) * transmissionEfficiency

  let thrustForce = getEngineForceFromTorque(torque, driveRatio, gearRatio[gearInput], wheelDiameter)

  let acceleration = (thrustForce - aeroDragForce - rollingResistanceForce - brakeForce) / mass
  let deltaV = acceleration * dts

  let currentGearSpeed = gearRatio[gearRatio.length-1] / gearRatio[gearInput] * gearSpeed
  let minRPM = engine.minRPM || 1000
  let rpmForSpeed = getEngineRpmForSpeed(speed, currentGearSpeed, minRPM)

  let newState = {
    speed : speed + (deltaV ? deltaV : 0),
    engineRpm : rpmForSpeed,
    acceleration, thrustForce, aeroDragForce, torque, power
  }

  // console.log(force,airDrag,wheelDrag,brakeForce)

  return Object.assign(car, { state : Object.assign(car.state, newState)})
}
