<script>
  import {onMount} from 'svelte'
  // import Plotly from 'plotly.js-dist'
  import uPlot from 'uplot'
  import 'uplot/dist/uPlot.min.css'  
  import * as cardata from '@/logic/cardata'
  import {Simulation} from '@/logic/simulation2'
  import * as Car from '@/logic/carphysics/carEntity'



  let carId = 'renault_zoe'

  let carSpecs = cardata.getCar(carId)

  let carAccelerationSim = Simulation()
  let carEntity = Car.create(carSpecs)
  carEntity.state.throttleInput = 1


  let time = 0
  let engineRpm = 0
  let speed = 0

  carAccelerationSim.addAnimate((t, dt) => {
    carEntity = Car.updateForces(carEntity, dt)
    
    // update display
    time = t
    engineRpm = carEntity.state.engineRpm
    speed = carEntity.state.speed

    // update chart
    // Plotly.extendTraces(chartEl, {y: [[speed*3.6]]}, [0])
    chartData[0].push(t/1000)
    chartData[1].push(speed*3.6)
    plotChart.setData(chartData)
  })

  function handleStart() {
    carAccelerationSim.start()
	}
  function handleStop() {
    carAccelerationSim.stop()
	}


  console.log(carSpecs, carEntity)

  function getData() {
    return Math.random()
  }

  const optsUplotChart = {
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
  };


  let chartEl
  let plotChart
  let chartData = [
    [],[]
      // [0, 100],    // x-values (timestamps)
      // [        35,         71],    // y-values (series 1)
      // [        90,         15],    // y-values (series 2)
    ];
  onMount(() => {
		chartEl = document.getElementById('chart');				
    // Plotly.newPlot(chartEl, [{
    //   y:[getData()],
    //   type:'line'
    // }])


    plotChart = new uPlot(optsUplotChart, chartData, chartEl);
  });

</script>


Car : {carSpecs.name}

<button on:click={handleStart}>Start</button>
<button on:click={handleStop}>Stop</button>
<br/>
<div>
  Time simulation elapsed : {Math.floor(time)}
</div>
<div>
  Speed : {Math.floor(speed*3.6)}
</div>
<div>
  Engine rpm : {Math.floor(engineRpm)}
</div>
<div id="chart"></div>