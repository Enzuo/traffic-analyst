<script>
  import { getCar } from "@/logic/cardata"
  import Icon from "../presentation/Icon.svelte"
  import SceneGraph from "./SceneGraph.svelte"


  export let carId
  export let trimId = 0
  export let engineId = 0

  let car

  $: car = getCar(carId, trimId, engineId)
  $: resetOnChange(carId) // on car props change we reset the trim id

  function handleTrimClick(id) {
    trimId = id
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
      <Icon name=cog></Icon>{engineList.engine.name} {engineList.engine.hp}
    </div>
  {/each}
{/if}

Car :

{car.brand}
{car.name}
{car.trim}
{car.engine.hp}
<SceneGraph car={car}></SceneGraph>

<style>
  .selected {
    color: plum;
  }
</style>