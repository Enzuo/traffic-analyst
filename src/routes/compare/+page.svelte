<script>
  import { onMount } from 'svelte'
  import UPlotRealtime from '@/components/container/UPlotRealtime.svelte'
  import { getPowerRequiredForSpeed } from '@/logic/carLogic/carlib'
  import UPlotGearing from '@/components/container/UPlotGearing.svelte'
  import {carCompare} from '@/logic/app/carCompare'
  import UPlotTorque from '@/components/container/UPlotTorque.svelte'
  import SceneGraphSimulation from '@/components/container/SceneGraphSimulation.svelte'
  import Table from '@/components/presentation/Table.svelte'
  import _get from 'lodash.get'

  export let data
  export let carIds = data.carIds
  const colors = ["blue","red","orange","green","purple"]

  // function updateParams(data){
  //   carIds = data.carIds
  // }





  let { carEntities, simulation, setup3Dsimulation } = carCompare(carIds)
  let time = 0
  let speed = 0


  // General infos table
  let generalInfosTableRows = [
    {label: 'brand'},
    {label: 'name'},
    {label: 'trim'},
    {label: 'year'},
    {label: 'power', units : 'hp', key : 'engine.hp'},
    {label: 'price'},
  ]
  let [generalInfosTableHeader, generalInfosTableData] = getTableData(carEntities, generalInfosTableRows)

  // Dimensions table
  let dimensionsTableRows = [
    {label: 'weight', units : 'kg'},
    {label: 'length', units : 'mm', key : 'length'},
    {label: 'width', units : 'mm'},
    {label: 'height', units : 'mm'},
    {label: 'wheelbase', units : 'mm'},
  ]
  let [dimensionsTableColumns, dimensionsDataTable] = getTableData(carEntities, dimensionsTableRows)


  function getTableData(data, rows){
    let columnsHead = data.map((c) => ({label : c.props.name}))
    let dataTable = data.map((c) => {
      let data = []
      rows.forEach((r) => {
        let key = r.key || r.label
        data.push(_get(c.props, key))
      })
      return data
    })
    return [columnsHead, dataTable]
  }

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

<section>
  <h3>General infos</h3>
  <Table rows={generalInfosTableRows} columns={generalInfosTableHeader} data={generalInfosTableData}></Table>
</section>

<section>
  <h3>Dimensions</h3>
  <Table rows={dimensionsTableRows} columns={dimensionsTableColumns} data={dimensionsDataTable}></Table>
</section>
<!-- <GraphRtUplot
  title="Power"
  units="kw"
  key="power"
  time={time}
  observed={carEntity.state}
></GraphRtUplot> -->