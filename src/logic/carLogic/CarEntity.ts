import {
  getAirDragForce,
  getRollingResistanceForce,
  getEngineForceFromTorque,
  getTransmissionEfficiency,
  getEngineForceFromPower,
  getTorqueForRPM,
  torqueToKW,
  getEngineRPMForSpeed
} from './carlib'

let uniqueId = 0

/**
 * @typedef {import('../cardata').Car} Car
 *
 *
 * @typedef {object} CarEntity
 * @property {number} id
 * @property {object} props
 * @property {object} state
 */
/**
 *
 * @param {Car} props
 * @returns {CarEntity}
 */

export class CarEntity{
  public id
  public props
  public state = {
    speed : 0, // m/s
    engineRpm : 0,
    enginePower : 0, // Kw
    engineTorque : 0,
    force : 0,
    acceleration : 0,
    airDrag : 0,

    // TODO remove
    throttleInput : 0,
    brakeInput : 0,
    gearInput : 0,
  }

  public inputs = {
    throttle : 0,
    brake : 0,
    gear : 0,
    gearT : 0, // gear transfer selected
  }



  constructor (props) {
    this.id = uniqueId++
    this.props = props
  }

  updateEngineRPM(){
    const { engine, wheelDiameter } = this.props
    const state = this.state

    let minRPM = engine.minRPM || 1000
    const finalRatio = this.getTransmissionFinalRatio()

    let rpmForSpeed = Math.max(getEngineRPMForSpeed(state.speed, finalRatio, wheelDiameter), minRPM)

    // update STATE
    this.state.engineRpm = rpmForSpeed
  }

  getTransmissionFinalRatio(){
    const {gearRatio, driveRatio, gearTransfer} = this.props
    const inputs = this.inputs

    let finalRatio = driveRatio * gearRatio[inputs.gear] * (gearTransfer ? gearTransfer[inputs.gearT] : 1)
    return finalRatio
  }

  getEndForce(){
    const {engine, wheelDiameter} = this.props
    const state = this.state
    const inputs = this.inputs

    const finalRatio = this.getTransmissionFinalRatio()
    let torque = getTorqueForRPM(engine.torqueCurve, state.engineRpm) * inputs.throttle
    let force = getEngineForceFromTorque(torque, finalRatio, null, wheelDiameter)

    return force
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

  let currentGearSpeed = gearRatio[gearRatio.length-1] / gearRatio[gearInput] * gearSpeed
  let minRPM = engine.minRPM || 1000
  let rpmForSpeed = Math.max(getEngineRPMForSpeed(speed, finalRatio, wheelDiameter), minRPM)

  if(car.props.type === 'plane'){
    if(car.props.engine.thrust){
      thrustForce = car.props.engine.thrust * throttleInput
      console.log(thrustForce)
    }
    else {
      rpmForSpeed = 2700 // * throttleInput
      const propellerRatio = 5.325 // torque to thrust ratio
      const propellerDiameter = 200
      torque = getTorqueForRPM(engine.torqueCurve, engineRpm)
      thrustForce = getEngineForceFromTorque(torque, propellerRatio, 1, propellerDiameter)
    }
  }

  let acceleration = (thrustForce - aeroDragForce - rollingResistanceForce - brakeForce) / mass
  let deltaV = acceleration * dts



  let newState = {
    speed : Math.max(speed + (deltaV ? deltaV : 0), 0),
    engineRpm : rpmForSpeed,
    acceleration, thrustForce, aeroDragForce, torque, power
  }

  // console.log(force,airDrag,wheelDrag,brakeForce)

  return Object.assign(car, { state : Object.assign(car.state, newState)})
}
