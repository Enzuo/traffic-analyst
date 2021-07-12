export default function Car() {
  // car spec
  let name = 'zoe'
  let rev = 83 // ratio (engine revolution / speed km/h) 
  let torqueCurve = [[0*rev,190], [7*rev,220], [33*rev,220], [50*rev,150], [70*rev,105], [90*rev, 80], [110*rev, 65], [135*rev, 52], [200*rev, 30]]
  let gearRatio = 1
  let weight = 1468
  let length = 4084
  let width = 1730
  let height = 1562
  let dragCoef = 0.29 // cd
  let dragArea = 2.1

  // car state
  let speed = 0 // Km/h
  let power = 0 // Kw
  let torque = 0 
  let rpm = speed * rev

  let force = 0
  let acc = 0
  let airDrag = 0

  function drive (t, dt) {
    const coefWheelDrag = 0.25
    const rho = 1.2
    const gravity = 10

    // wheel drag force
    let wheelDrag = weight * coefWheelDrag

    // https://www.engineeringtoolbox.com/drag-coefficient-d_627.html
    // Fd = 1/2 ρ v2 cd A                      
    // where
    // Fd = drag force (N)
    // ρ = density of fluid (1.2 kg/m3 for air at NTP)
    // v = flow velocity (m/s)
    // cd = drag coefficient
    // A = characteristic frontal area of the body  (m2)
    airDrag = 0.5 * rho * Math.pow(speed/3.6, 2) * dragCoef * dragArea 


    // allow drive from a standstill
    rpm = Math.max(rpm, 50)

    torque = getTorqueForRPM(torqueCurve, rpm)
    power = torqueToKW(torque, rpm)

    dt = dt / 1000 // dt in seconds

    let mass = weight
    let distance = (Math.max(speed, 3.6) / 3.6) * dt
    let work = power * 1000 * dt
    force = work / distance
    acc = Math.max((force - airDrag - wheelDrag), 0) / mass
    let deltaV = acc * dt

    // let deltaV = (power * 1000 * Math.pow(dt, 2)) / (mass * distance)
    speed += deltaV * 3.6

    rpm = speed * rev
  }

  function getState() {
    return {speed, power, torque, force, acc, airDrag}
  }

  return {
    drive,
    getState
  }
}

/*-----------------

      Helpers

-----------------*/
function torqueToKW(torque, rpm){
  if(torque === null || !rpm){ return null }
  return (torque * rpm) / 9549
}

/**
 * 
 * @param curve [[rpm, torque]]
 */
// Get Torque for any RPM
// Assuming the torqueCurve is of the form
// [[rpm, torque],[rpm, torque],...]
// (Interpolate curve)
type torqueCurve = number[][]
function getTorqueForRPM (torqueCurve : torqueCurve, rpm : number) : number {
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