import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  
import { getEngineRpmForSpeed, getTorqueForRPM, getEngineForceFromTorque } from '../carphysics/physics'


export function createGraph(car, element){

  let graphData = [[]]
  let gearSeries = []
  const colors = ["blue", "red", "orange", "green", "purple", "grey", "grey", "grey"]
  for(let i = 0; i < car.gearRatio.length; i++){
    gearSeries.push({
      label: "gear "+(i+1),
      scale: "n",
      value: (u, v) => v == null ? "-" : v.toFixed(1),
      stroke: colors[i]
    })
    graphData.push([])
  }


  const speedIncrement = 5
  const maxSpeed = 250
  let speed = 0
  while(speed <= maxSpeed){
    graphData[0].push(speed)
    for(let i = 0; i < car.gearRatio.length; i++){
      let currentGearSpeed = car.gearRatio[car.gearRatio.length-1] / car.gearRatio[i] * car.gearSpeed
      let rpm = getEngineRpmForSpeed(speed/3.6, currentGearSpeed)
      let torque = getTorqueForRPM(car.engine.torqueCurve, rpm)
      let force = getEngineForceFromTorque(torque, car.driveRatio, car.gearRatio[i], car.wheelDiameter)

      graphData[i+1].push(force)

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
      ...gearSeries
    ],
    scales: {
      "x": {
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
        scale: 'y',
        values: (u, vals, space) => vals.map(v => +v.toFixed(1)),
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