<script>
  import { createEventDispatcher } from "svelte"
  import { getCar } from "@/logic/cardata"
  import Icon from "@/components/presentation/Icon.svelte"
  import SceneGraph from "./SceneGraph.svelte"
  import UPlotGearing from "./UPlotGearing.svelte"
  import UPlotTorque from "./UPlotTorque.svelte"
  import CarTrimSelector from "@/components/presentation/CarTrimSelector.svelte"
  import CarEngineSelector from "@/components/presentation/CarEngineSelector.svelte"


  export let carId
  export let trimId = 0
  export let engineId = 0

  const dispatch = createEventDispatcher()

  let car

  $: loadCar(carId, trimId, engineId)


  function loadCar(carId, trimId, engineId){
    console.log('trim', typeof trimId, trimId)
    if(carId){
      car = getCar(carId, trimId, engineId)
    }
    else {
      car = null
    }
  }



  function handleTrimSelect(id) {
    dispatch('select', {
      trim : id,
      engine : 0,
    })
  }

  function handleEngineSelect(id) {
    dispatch('select', {
      trim : trimId,
      engine : id,
    })
  }



</script>


<SceneGraph car={car}></SceneGraph>

<CarTrimSelector trims={car.trims} selectedId={trimId} on:select={(e) => handleTrimSelect(e.detail.id)}/>

<CarEngineSelector engines={car.engines} selectedId={engineId} on:select={(e) => handleEngineSelect(e.detail.id)}/>

Car :

{car.brand}
{car.name}
{car.trim}
<li>{car.engine.hp} HP</li>
<li>{car.weight} KG</li>
<li>{car.gearRatio}</li>
<li>{car.driveRatio} Drive Ratio</li>
<li>{car.gearTransfer ? car.gearTransfer[0] : 1} Transfer Ratio</li>

<UPlotGearing car={car}></UPlotGearing>
<UPlotTorque cars={[car]}></UPlotTorque>



<style>
  .selected {
    color: plum;
  }
</style>