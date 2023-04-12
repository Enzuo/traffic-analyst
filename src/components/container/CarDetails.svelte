<script>
  import Icon from "../presentation/Icon.svelte";
  import SceneGraph from "./SceneGraph.svelte";


  export let carWithTrims
  export let trimId = 0
  let car

  $: trimId = resetTrim(carWithTrims) // on car props change we reset the trim id

  $: car = carWithTrims[trimId]

  function handleTrimClick(index) {
    trimId = index
  }

  function handleEngineClick(index) {

  }

  function resetTrim(trims){
    return 0
  }

</script>


Trims : 
{#each carWithTrims as trim, index}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="trim" on:click={() => handleTrimClick(index)}>
    <Icon name=truck></Icon>{trim.trim}
  </div>
{/each}

Engines : 

{#if car.engines}
  {#each car.engines as list, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="trim" on:click={() => handleEngineClick(index)}>
      <Icon name=cog></Icon>{list.engine.name} {list.engine.hp}
    </div>
  {/each}
{/if}

Car :

{car.brand}
{car.name}
{car.trim}
{car.engine.hp}
<SceneGraph car={car}></SceneGraph>