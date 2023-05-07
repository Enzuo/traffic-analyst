<script>
  import { onMount } from 'svelte'
  import UPlotRealtime from '@/components/container/UPlotRealtime.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carLogic/physics'
  import UPlotGearing from '@/components/container/UPlotGearing.svelte'
  import {carCompare} from '@/logic/app/carCompare'
  import UPlotTorque from '@/components/container/UPlotTorque.svelte'
  import SceneGraphSimulation from '@/components/container/SceneGraphSimulation.svelte';

  export let data
  // let carIds = ['toyota_hilux', ['toyota_hilux', '102hp']]
  export let carIds = data.carIds
  // let carIds = ['landrover_defender', ['landrover_defender', 'defender110']]
  const colors = ["blue","red","orange","green","purple"]

  // function updateParams(data){
  //   carIds = data.carIds
  // }




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

</script>
<SceneGraphSimulation carEntities={carEntities} simulation={simulation} colors={colors}></SceneGraphSimulation>
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
<UPlotTorque cars={carEntities.map(c => c.props)}></UPlotTorque>

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