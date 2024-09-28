import {
  getAirDragForce,
  getRollingResistanceForce,
  getEngineForceFromTorque,
  getTransmissionEfficiency,
  getEngineForceFromPower,
  getTorqueForRPM,
  torqueToKW,
  getEngineRPMForSpeed
} from '../lib/carlib'

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
  public TCU = createBasicTCU(this)
  public shifter = createShifter(this)



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
    const {gearRatio, driveRatio, gearTransfer} = this.props.gearbox
    const inputs = this.inputs

    let finalRatio = driveRatio * gearRatio[inputs.gear] * (gearTransfer ? gearTransfer[inputs.gearT] : 1)
    return finalRatio
  }

  getEndForce(){
    const {engine, wheelDiameter} = this.props
    const state = this.state
    const inputs = this.inputs

    const finalRatio = this.getTransmissionFinalRatio()
    let torque = getTorqueForRPM(engine.torqueCurve, state.engineRpm, engine.power) * inputs.throttle
    let force = getEngineForceFromTorque(torque, finalRatio, null, wheelDiameter)

    return force
  }

  /**
   *
   * @param {number} gear
   */
  shiftToGear(gear){

  }

  shiftUp(){
    let maxGear = this.props.gearbox.gearRatio.length - 1
    let targetGear = Math.min(this.state.gearInput+1, maxGear)
    this.shifter.shift(targetGear)
  }

  update(time, dt){
    this.TCU.update(time, dt)
    this.shifter.update(time, dt)

    updateForces(this, dt)
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
  const {engine, gearbox, gearSpeed, weight, dragCoef, dragArea, brakePadsForce, wheelDiameter} = car.props
  const {speed, engineRpm, throttleInput, brakeInput, gearInput} = car.state
  const {gearRatio, driveRatio, gearTransfer} = gearbox

  // wheel drag force
  let slope = 0

  let rollingResistanceForce = getRollingResistanceForce(speed, car.state.acceleration, weight)
  let aeroDragForce = getAirDragForce(speed, dragCoef * dragArea)

  let torque = getTorqueForRPM(engine.torqueCurve, engineRpm, engine.power) * throttleInput
  let power = torqueToKW(torque, engineRpm)

  // brake
  let brakeForce = brakeInput * brakePadsForce

  // calculate acceleration
  const mass = weight

  // let transmissionEfficiency = getTransmissionEfficiency(gearRatio[gearInput])
  // let thrustForce = getEngineForceFromPower(speed, power, dts) * transmissionEfficiency
  let finalRatio = driveRatio * gearRatio[gearInput] * (gearTransfer ? gearTransfer[0] : 1)
  let thrustForce = getEngineForceFromTorque(torque, finalRatio, null, wheelDiameter)
  if(car.shifter.isShifting){
    thrustForce = 0
  }

  // let currentGearSpeed = gearRatio[gearRatio.length-1] / gearRatio[gearInput] * gearSpeed
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
      torque = getTorqueForRPM(engine.torqueCurve, engineRpm, engine.power)
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

/**
 * Car shifter
 *
 * @param {CarEntity} car
 */
function createShifter(car){
  const shiftTime = 1000 // 0.2s for hydro auto, manual 0.5-1s for vertical shift 1-2s for horizontals
  let isShifting = false
  let shiftStartTime
  let currentTime
  let shiftTo

  function shift(targetGear){
    if(isShifting) {
      return
    }
    shiftStartTime = currentTime
    isShifting = true
    shiftTo = targetGear
  }

  function update(time, dt){
    currentTime = time
    if(shiftStartTime && (shiftStartTime + shiftTime < currentTime)){
      isShifting = false
      shiftStartTime = null
      car.state.gearInput = shiftTo
    }
  }

  return {
    shift,
    update,
    get isShifting(){
      return isShifting
    }
  }
}


/**
 * Transmission Control Unit
 *
 * Pick the correct transmission gear for the given car state
 * (used for manual cars as well cause well... they're controlled by a computer too)
 *
 * @param {CarEntity} car
 */
function createBasicTCU(car){
  function update(time, dt){
      // switch gear
      const maxRpm = car.props.engine.torqueCurve.length ? car.props.engine.torqueCurve[car.props.engine.torqueCurve.length-1][0] : 0
      // maxRpm = 3500
      if(car.state.engineRpm >= maxRpm){
        // car.state.throttleInput = 0
        // let maxGear = car.props.gearbox.gearRatio.length - 1
        // if(car.state.gearInput < maxGear){
        //   car.state.gearInput += 1
        // }
        car.shiftUp()
      }
  }

  return {
    update
  }
}