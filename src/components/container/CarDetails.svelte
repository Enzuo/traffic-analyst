<script>
  import { getCar } from "@/logic/cardata"
  import Icon from "../presentation/Icon.svelte"
  import SceneGraph from "./SceneGraph.svelte"
  import UPlotGearing from "./UPlotGearing.svelte"
  import UPlotTorque from "./UPlotTorque.svelte"


  export let carId
  export let trimId = 0
  export let engineId = 0

  let car

  $: resetOnChange(carId) // on car props change we reset the trim id
  $: car = getCar(carId, trimId, engineId)

  function handleTrimClick(id) {
    trimId = id
    engineId = 0
  }

  function handleEngineClick(id) {
    engineId = id
  }

  function resetOnChange(car){
    trimId = 0
    engineId = 0
  }

</script>


Trims : 
{#each car.trims as trimlist, index}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="trim {index===trimId ? 'selected' : ''}" on:click={() => handleTrimClick(index)}>
    <Icon name=truck></Icon>{trimlist.trim}
  </div>
{/each}

Engines : 

{#if car.engines}
  {#each car.engines as engineList, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="trim {index===engineId ? 'selected' : ''}" on:click={() => handleEngineClick(index)}>
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

<SceneGraph car={car}></SceneGraph>

<style>
  .selected {
    color: plum;
  }
</style>