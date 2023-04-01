<script>
  import UPlotRealtime from './UPlotRealtime.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carphysics/physics'
  import UPlotGearing from './UPlotGearing.svelte'
  import {carCompare} from '@/logic/app/carCompare'
  import UPlotTorque from './UPlotTorque.svelte'


  let carIds = ['fiat_500', 'citroen_ln', 'dacia_logan']
  let colors = ["blue","red","orange","green","purple"]
  let colors3D = [0x5895FF,0xFF5758,0xFFA132,"green","purple"]


  let { carEntities, simulation, setup3Dsimulation } = carCompare(carIds)
  let time = 0
  let speed = 0
  // simulation observe
  simulation.subscribeTick((t, dt) => {
    time = t
  })

  function handleStart() {
    simulation.start()
	}
  function handleStop() {
    simulation.stop()
	}

  function mstokmh(ms){
    return ms * 3.6
  }

  setup3Dsimulation(document.body, colors3D)

</script>
{#each carEntities as carEntity}
  Car : {carEntity.props.name} {carEntity.props.trim}
{/each}
<button on:click={handleStart}>Start</button>
<button on:click={handleStop}>Stop</button>
<br/>
<div>
  Time simulation elapsed : {(time/1000).toFixed(1)}
</div>
<div>
  Speed : {Math.floor(speed*3.6)}
</div>
<div>
  Power needed : {getPowerRequiredForSpeed(speed, carEntities[0].props.weight, carEntities[0].props.dragCoef * carEntities[0].props.dragArea).toFixed(1)}
</div>

<UPlotGearing car={carEntities[0].props}></UPlotGearing>
<UPlotTorque cars={carEntities}></UPlotTorque>

<UPlotRealtime 
  title="Speed" 
  key="speed" 
  transformFn={mstokmh}
  time={time}
  colors={colors}
  observed={carEntities}
></UPlotRealtime>
<UPlotRealtime 
  title="Acceleration" 
  units="m/s²" 
  key="acceleration" 
  time={time}
  colors={colors}
  observed={carEntities}
></UPlotRealtime>
<!-- <GraphRtUplot 
  title="Power" 
  units="kw" 
  key="power" 
  time={time}
  observed={carEntity.state}
></GraphRtUplot> -->