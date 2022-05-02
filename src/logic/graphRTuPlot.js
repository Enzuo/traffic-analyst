import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  


// let plotChart

let chartData = [
  [],[]
];

export function createGraph(opts, element){

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
      {
        label: opts.units || "Km/h",
        scale: "y",
        value: (u, v) => v == null ? "-" : v.toFixed(1),
        stroke: "blue",
      },
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
  return { setData : (data) => {
    plotChart.setData(data)
  }}
}

