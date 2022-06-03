import { prepare } from '@svgdotjs/svg.js'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  
import { getEngineRpmForSpeed, getTorqueForRPM, getEngineForceFromTorque, getResistanceForceAtSpeed, torqueToKW } from '../carphysics/physics'


export function createGraph(cars, element, opts = {}){

  let colors = opts.colors ? opts.colors : ["blue","red","orange","green"]


  // for each car create torque & power series
  let series = []
  for(let i=0; i< cars.length; i++){
    let car = cars[i]

    let torqueSerie = {
      label: "torque",
      scale: "nm",
      value: (u, v) => v == null ? "-" : v.toFixed(0),
      stroke: colors[i],
      dash: [10, 5],
      spanGaps: true,
    }
    let powerSerie = {
      label: "power",
      scale: "hp",
      value: (u, v) => v == null ? "-" : v.toFixed(0),
      stroke: colors[i],
      spanGaps: true,
    }
    series.push(torqueSerie)
    series.push(powerSerie)
  }


  function prepareData(cars){
    // let minRPM = 0
    // let allCarsRPM = cars.map( car => { 
    //   let maxX = car.props.engine.torqueX[car.props.engine.torqueX.length-1]
    //   return maxX
    // })
    // let maxRPM = Math.max(...allCarsRPM)

    let torqueXArray = cars.map(car => {
      let xMultiplier = car.props.engine.torqueXMultiplier || 1
      return car.props.engine.torqueX.map(x => x * xMultiplier)
    })
    let torqueX = [].concat(...torqueXArray)
    // delete duplicates
    // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    let rpms = torqueX.filter(function(item, pos) {
      return torqueX.indexOf(item) == pos;
    })
    rpms.sort((a,b) => a - b)

    let data = [rpms]
    // generate curves data
    for(var i=0; i<cars.length; i++) {
      let car = cars[i]
      let engine = car.props.engine
      let xMultiplier = engine.torqueXMultiplier || 1
      let torque = []
      let hp = []
      for(let j=0; j<rpms.length; j++) {
        let rpm = rpms[j]
        let index = engine.torqueX.findIndex(x => x * xMultiplier === rpm)
        if(index >= 0 ){
          let t = engine.torqueY[index]
          torque.push(t)
          hp.push(torqueToKW(t, rpm))
        }
        else {
          torque.push(null)
          hp.push(null)
        }
      }
      data.push(torque)
      data.push(hp)
    }

    return data
  }
  let data = prepareData(cars)
  console.log(data)


  // uPlot chart
  const options = {
    title: "Power",
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
      ...series
    ],
    scales: {
      "x": {
        title:"rpm",
        time: false,
      },
      'hp': {
        // range: [0, 150],
      }
    },
    axes: [
      {},
      {
        space: 60,
        scale: 'nm',
        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
        side: 1,
        grid: {show: false},
      },
      {
        space: 60,
        scale: 'hp',
        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
        side: 1,
        grid: {show: false},
      }
    ],
  }
  
  let plotChart = new uPlot(options, data, element);

}