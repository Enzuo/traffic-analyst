var id = 0

export function create () {
  const rev = 83
  const speed = 0
  const torqueCurve = [[0*rev,190], [7*rev,220], [33*rev,220], [50*rev,150], [70*rev,105], [90*rev, 80], [110*rev, 65], [135*rev, 52], [200*rev, 30]]
  
  return {
    id : id++,
    
    // car spec
    props : {
      name : 'zoe',
      revR : rev, // ratio (engine revolution / speed km/h)
      torqueCurve : torqueCurve,
      gearRatio : 1,
      weight : 1468,
      length : 4084,
      width : 1730,
      height : 1562,
      dragCoef : 0.29, // cd
      dragArea : 2.1,
    },

    // car state
    state : {
      speed : speed, // Km/h
      rpm : speed * rev,
      throttle : 0,
      power : 0, // Kw
      torque : 0, 
      
      force : 0,
      acceleration : 0,
      airDrag : 0,
    }
  }
}

export function accelerate (car, throttleRatio) {
  car.state.throttle = Math.max(Math.min(throttleRatio, 1), 0)
  return car
}

export function animate (car, t, dt) {
  const coefWheelDrag = 0.25
  const gravity = 10

  const {weight, dragCoef, dragArea, torqueCurve, revR} = car.props
  let {speed, rpm, throttle} = car.state

  // wheel drag force
  let wheelDrag = weight * coefWheelDrag
  let airDrag = getAirDragForce(speed/3.6, dragCoef, dragArea)

  // allow drive from a standstill
  rpm = Math.max(rpm, 50)

  let torque = getTorqueForRPM(torqueCurve, rpm) * throttle
  let power = torqueToKW(torque, rpm)

  dt = dt / 1000 // dt in seconds

  const mass = weight
  let distance = (Math.max(speed, 3.6) / 3.6) * dt
  let work = power * 1000 * dt
  let force = work / distance
  let acceleration = (force - airDrag - wheelDrag) / mass
  let deltaV = acceleration * dt

  // let deltaV = (power * 1000 * Math.pow(dt, 2)) / (mass * distance)
  speed += deltaV ? deltaV * 3.6 : 0
  rpm = speed * revR

  car.state = {
    ...car.state, 
    speed, rpm, 
    power, torque, force, acceleration, airDrag,
  }
  return car
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