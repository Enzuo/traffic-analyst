let uniqueId = 0

export default function Car ({
  speed = 0
}) {  
  const revRatio = 83

  this.id = uniqueId++
  // car props
  this.props = {
    name : 'zoe',
    // ratio (engine revolution / speed km/h)
    revRatio : revRatio,
    torqueCurve : [
      [0*revRatio,190], 
      [7*revRatio,220], 
      [33*revRatio,220], 
      [50*revRatio,150], 
      [70*revRatio,105], 
      [90*revRatio, 80], 
      [110*revRatio, 65], 
      [135*revRatio, 52], 
      [200*revRatio, 30]
    ],
    gearRatio : 1,
    weight : 1468,
    length : 4084,
    width : 1730,
    height : 1562,
    dragCoef : 0.29, // cd
    dragArea : 2.1,
    brakePadsForce : 15000,
  }

  // car state
  this.state = {
    speed : speed, // m/s
    rpm : speed * revRatio,
    throttle : 0,
    brake : 0,
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
  this.accelerate = function (throttleRatio) {
    this.state.throttle = Math.max(Math.min(throttleRatio, 1), 0)
    this.state.brake = 0
  }

    /**
   * Adjust car brakes
   * @param {number} brakeRatio 0.0 to 1.0
   */
  this.brake = function (brakeRatio) {
    this.state.brake = Math.max(Math.min(brakeRatio, 1), 0)
    this.state.throttle = 0
  }

  /**
   * 
   * @param {*} t 
   * @param {*} dt delta time in ms since last tick
   */
  this.animate = function (t, dt) {
    this.updateForces(dt / 1000)
  }

  /**
   * 
   * @param {number} dt delta time in seconds
   */
  this.updateForces = function (dt){
    const coefWheelDrag = 0.25
    const gravity = 10
    const {torqueCurve, weight, dragCoef, dragArea, brakePadsForce} = this.props
    const {speed, rpm, throttle, brake} = this.state

    // wheel drag force
    let wheelDrag = weight * coefWheelDrag // * Math.min(Math.abs(state.speed), 1)
    let airDrag = getAirDragForce(speed, dragCoef, dragArea)

    let torque = getTorqueForRPM(torqueCurve, rpm) * throttle
    let power = torqueToKW(torque, rpm)

    // brake
    let brakeForce = brake * brakePadsForce

    // calculate acceleration
    const mass = weight
    let distance = (Math.max(speed, 1)) * dt // min speed of 1m/s
    let work = power * 1000 * dt
    let force = work / distance
    let acceleration = (force - airDrag - wheelDrag - brakeForce) / mass
    let deltaV = acceleration * dt

    // update state
    this.setSpeed(speed + (deltaV ? deltaV : 0))
    Object.assign(this.state, {acceleration, force, airDrag, torque, power})
  }

  this.setSpeed = function (speed) {
    this.state.speed = Math.max(speed, 0)

    // mininum rpm : allow drive from a standstill
    this.state.rpm = Math.max(speed * 3.6 * revRatio, 50)
  }

  this.getState = function () {
    return this.state
  }

  // return {
  //   id,
  //   accelerate,
  //   setSpeed,
  //   animate,
  //   getState,
  // }
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