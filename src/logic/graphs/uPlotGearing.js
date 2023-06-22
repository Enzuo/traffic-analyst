import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { getTorqueForRPM, getEngineForceFromTorque, getResistanceForceAtSpeed, getEngineRPMForSpeed } from '../carLogic/physics'


/**
 *
 * @param {*} car
 * @param {*} element
 * @param {{isGearForce?:boolean}} graphOptions
 * @returns
 */
export function createGraph(car, element, graphOptions = {}){

  let graphData = [[]]


  let gearSeries = []
  const colors = ["blue", "red", "orange", "green", "purple", "grey", "grey", "grey", "grey", "grey", "grey", "grey"]
  for(let i = 0; i < car.gearRatio.length; i++){
    gearSeries.push({
      label: (i+1),
      scale: "n",
      value: (u, v) => v == null ? "-" : v.toFixed(0),
      stroke: colors[i]
    })
    graphData.push([])
  }

  // resistance force
  let resistanceSerie = {
    label: "drag",
    scale: "n",
    value: (u, v) => v == null ? "-" : v.toFixed(1),
    stroke: "darkgrey"
  }
  graphData.push([])



  const speedIncrement = 2
  const maxSpeed = 200
  let speed = 0
  const minRPM = car.engine.torqueCurve.length ? car.engine.torqueCurve[0][0] : 0
  const maxRPM = car.engine.torqueCurve.length ? car.engine.torqueCurve[car.engine.torqueCurve.length-1][0] : 0
  while(speed <= maxSpeed){
    graphData[0].push(speed)
    let speedms = speed / 3.6

    // TODO tmp debug cessna
    if(car.type === 'plane'){
      let thrust
      if(car.engine.thrust){
        thrust = car.engine.thrust
      }
      else {
        let torque = getTorqueForRPM(car.engine.torqueCurve, 2700)
        thrust = getEngineForceFromTorque(torque, 5.325, 1, 200)
      }
      graphData[1].push(thrust)
      graphData[graphData.length-1].push(getResistanceForceAtSpeed(speedms, car.weight, car.dragArea * car.dragCoef))
      speed += speedIncrement
      continue
    }

    for(let i = 0; i < car.gearRatio.length; i++){
      let finalRatio = car.gearRatio[i] * car.driveRatio * (car.gearTransfer ? car.gearTransfer[0] : 1)
      let rpm = getEngineRPMForSpeed(speedms, finalRatio, car.wheelDiameter)
      let torque = getTorqueForRPM(car.engine.torqueCurve, rpm)
      let force = getEngineForceFromTorque(torque, finalRatio, null, car.wheelDiameter)

      if(graphOptions.isGearForce){
        graphData[i+1].push(force)
      }
      else {
        if(rpm > minRPM && rpm < maxRPM){
          graphData[i+1].push(rpm)
        }
        else {
          graphData[i+1].push(null)
        }
      }
    }

    if(graphOptions.isGearForce){
      graphData[graphData.length-1].push(getResistanceForceAtSpeed(speedms, car.weight, car.dragArea * car.dragCoef))
    }

    speed += speedIncrement
  }


  const options = {
    title: "Gearing",
    width: 800,
    height: 300,
    cursor: {
      drag: {
        setScale: false,
      }
    },
    // select: {
    //   show: false,
    // },
    series : [
      {},
      ...gearSeries,
      resistanceSerie
    ],
    scales: {
      "x": {
        title:"speed",
        time: false,
      },
      'y': {
        // range: [0, 150],
      }
    },
    axes: [
      {},
      {
        space: 60,
        scale: 'n',
        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
        side: 1,
        grid: {show: false},
      }
    ],
  }

  let plotChart = new uPlot(options, graphData, element);
  return { setData : (data) => {
    plotChart.setData(data)
  }}

}