export default function Car() {
  let speed = 0
  let power = 0
  let torque = 0

  // car spec
  let name = 'zoe'
  let torqueCurve = [[7,220], [35,220], [50,145], [70,105], [90, 80], [110, 65], [135, 52]]
  let gearRatio = 1
  let weight = 1468
  let length = 4084
  let width = 1730
  let height = 1562
  let dragCoef = 0.29 // cd
  let dragArea = 2.1

  function drive (dt) {
    const coefWheelDrag = 0.25
    const rho = 1.2
    let SCd = dragArea * dragCoef
    const gravity = 10
    // masse volumique air
    let wheelDrag = weight * coefWheelDrag * speed

    // https://www.engineeringtoolbox.com/drag-coefficient-d_627.html
    // Fd = 1/2 ρ v2 cd A                      
    // where
    // Fd = drag force (N)
    // ρ = density of fluid (1.2 kg/m3 for air at NTP)
    // v = flow velocity (m/s)
    // cd = drag coefficient
    // A = characteristic frontal area of the body  (m2)
    let airDrag = 0.5 * rho * Math.pow(speed, 2) * dragCoef * dragArea 


    // 
    torque = getTorqueForRPM(torqueCurve, dt/100)
    power = torqueToKW(torque, dt/100)
  }

  function getState() {
    return {speed, power, torque}
  }

  return {
    drive,
    getState
  }
}

/*-----------------

  Helpers

-----------------*/


function torqueToPS(torque, rpm){
  if(torque === null || !rpm){ return null }
  return (torque * rpm) / (9549 * 0.7457)
}

function torqueToKW(torque, rpm){
  if(torque === null || !rpm){ return null }
  return (torque * rpm) / 9549
}

function torqueToPSperT(torque, rpm, weight){
  if(torque === null){ return null }    
  return torqueToPS(torque, rpm) / (weight / 1000)
}

function PSToTorque(PS, rpm){
  if(!PS || !rpm ) return 0
  return (PS * (9549 * 0.7457)) / rpm
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
  var index = torqueCurve.findIndex((torque) => {
      return rpm < torque[0]
  })
  if(index <= 0){
      return null
  }
  var prevTorquePoint = torqueCurve[index-1]
  var nextTorquePoint = torqueCurve[index]

  var distRPM = nextTorquePoint[0] - prevTorquePoint[0]
  var distPercent = (rpm - prevTorquePoint[0]) / distRPM
  var distTorque = nextTorquePoint[1] - prevTorquePoint[1]
  return prevTorquePoint[1] + distTorque * distPercent
}

let a = [[1,2], [1,5]]
getTorqueForRPM(a, 124)