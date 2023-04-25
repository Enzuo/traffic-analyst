<script>
  import { getCar } from "@/logic/cardata"
  import Icon from "../presentation/Icon.svelte"
  import SceneGraph from "./SceneGraph.svelte"
  import UPlotGearing from "./UPlotGearing.svelte"
  import UPlotTorque from "./UPlotTorque.svelte"
  import { createEventDispatcher } from "svelte"


  export let carId
  export let trimId = 0
  export let engineId = 0

  const dispatch = createEventDispatcher()

  let car

  $: loadCar(carId, trimId, engineId)


  function loadCar(carId, trimId, engineId){
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

Trims :
{#each car.trims as trimlist, index}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="trim {index===trimId ? 'selected' : ''}" on:click={() => handleTrimSelect(index)}>
    <Icon name=truck></Icon>{trimlist.trim}
  </div>
{/each}

Engines :

{#if car.engines}
  {#each car.engines as engineList, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="trim {index===engineId ? 'selected' : ''}" on:click={() => handleEngineSelect(index)}>
      <Icon name=cog></Icon>{engineList.engine.name} {engineList.engine.hp} {engineList.gearName}
    </div>
  {/each}
{/if}

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