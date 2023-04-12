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

Car :

{car.brand}
{car.name}
{car.trim}
{car.engine.hp}
<SceneGraph car={car}></SceneGraph>