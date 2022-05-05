import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  


// let plotChart

// let chartData = [
//   [],[]
// ];

let chartData = [[]]

/**
 * 
 * @param {{title:string, units:string, key:string, transformFn:(v:number)=>number}} opts 
 * @param {[{props:object, state:object}]} observed 
 * @param {*} element 
 * @returns 
 */
export function createGraph(opts, observed, element){

  let series = []
  let colors = ["blue","red","orange","green"]
  for(let i=0; i<observed.length; i++){
    series.push({
      label: observed[i].props.name,
      scale: "y",
      value: (u, v) => v == null ? "-" : v.toFixed(1) + (opts.units || 'km/h'),
      stroke: colors[i],
    })

    chartData.push([])
  }

  const options = {
    title: opts.title || "Speed",
    width: 300,
    height: 300,
    cursor: {
      drag: {
        setScale: false,
      }
    },
    select: {
      show: false,
    },
    series: [
      {},
      ...series
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
  
  let plotChart = new uPlot(Object.assign(options, opts), chartData, element);
  let {key, transformFn} = opts
  return { 
    setData : (data) => {
      plotChart.setData(data)
    },
    updateData : (t, observed) => {
      chartData[0].push(t/1000)
      for(let i=0; i<observed.length; i++){
        let value = transformFn ? transformFn(observed[i].state[key]) : observed[i].state[key]
        chartData[i+1].push(value)
        
      }
      plotChart.setData(chartData)
    }
  }
}

