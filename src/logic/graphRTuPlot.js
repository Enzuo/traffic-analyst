import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  

const options = {
  title: "Speed",
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
      label: "Km/h",
      scale: "kmh",
      value: (u, v) => v == null ? "-" : v.toFixed(1),
      stroke: "blue",
    },
  ],
  scales: {
    "x": {
      time: false,
    },
    'kmh': {
      // range: [0, 150],
    }
  },
  axes: [
    {},
    {
      space: 60,
      scale: 'kmh',
      values: (u, vals, space) => vals.map(v => +v.toFixed(1)),
      side: 1,
      grid: {show: false},
    }
  ],
}

// let plotChart

let chartData = [
  [],[]
];

export function createGraph(opts, element){
  let plotChart = new uPlot(Object.assign(options, opts), chartData, element);
  return { setData : (data) => {
    plotChart.setData(data)
  }}
}

