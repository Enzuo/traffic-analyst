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
      points : {show: false},
    }
    let powerSerie = {
      label: "power",
      scale: "hp",
      value: (u, v) => v == null ? "-" : v.toFixed(0),
      stroke: colors[i],
      spanGaps: true,
      points : {show: false},
    }
    series.push(torqueSerie)
    series.push(powerSerie)
  }


  function getXKeys(cars){
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

    return rpms
  }

  function getXFill(cars, step = 500){
    let minRPM = 0
    let allCarsRPM = cars.map( car => { 
      let xMultiplier = car.props.engine.torqueXMultiplier || 1
      let maxX = car.props.engine.torqueX[car.props.engine.torqueX.length-1] * xMultiplier
      return maxX
    })
    let maxRPM = Math.max(...allCarsRPM)

    let rpms = []
    for(var i=minRPM; i<maxRPM; i+=step) {
      rpms.push(i)
    }

    return rpms
  }

  function getYKey(car, rpm){
    let engine = car.props.engine
    let xMultiplier = engine.torqueXMultiplier || 1
    let index = engine.torqueX.findIndex(x => x * xMultiplier === rpm)
    if(index >= 0 ){
      let torque = engine.torqueY[index]
      return { torque, power :  torqueToKW(torque, rpm)}
    }
    return { torque : null, power : null}
  }

  function getYFill(car, rpm){
    let engine = car.props.engine
    let xMultiplier = engine.torqueXMultiplier || 1
    let torque = getTorqueForRPM(engine.torqueCurve, rpm)
    let power = torqueToKW(torque, rpm)
    return {torque, power}
  }

  function prepareData(cars){

    let rpms = getXFill(cars)


    let data = [rpms]
    // generate curves data
    for(var i=0; i<cars.length; i++) {
      let car = cars[i]
      let engine = car.props.engine
      let xMultiplier = engine.torqueXMultiplier || 1
      let torqueArray = []
      let powerArray = []
      for(let j=0; j<rpms.length; j++) {
        let rpm = rpms[j]
        let {torque, power} = getYFill(car, rpm)
        torqueArray.push(torque)
        powerArray.push(power)
      }
      data.push(torqueArray)
      data.push(powerArray)
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