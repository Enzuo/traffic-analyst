import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'  


export function createGraph(fn, element, rangeX=[0,5], rangeY=[0,50]){

  let graphData = [[], []]

  const options = {
    width: 50,
    height: 50,
    cursor: {
      drag: {
        setScale: false,
      }
    },
    legend : {
      show : false
    },
    series : [{}, {
      // label: "fn",
      // scale: "y",
      value: (u, v) => v == null ? "-" : v.toFixed(1),
      width: 2,
      stroke: "blue",
      // fill: "rgba(255, 0, 0, 0.3)",
    }],
    scales: {
      "x": {
        time: false,
      },
      'y': {
        range: [0, 50],
      }
    },
    axes: [
      {
        show: false,
      },
      {
        show: false,
        space: 60,
        scale: 'y',
        values: (u, vals, space) => vals.map(v => +v.toFixed(0)),
        side: 1,
        grid: {show: false},
      }
    ],
  }

  for(var x=rangeX[0]; x <= rangeX[1]; x+=0.1){
    let y = fn(x)
    graphData[0].push(x)
    graphData[1].push(y)
  }

  let plotChart = new uPlot(options, graphData, element);
}
