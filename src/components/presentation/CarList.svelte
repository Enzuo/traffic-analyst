<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "./Icon.svelte"


  export let cars
  export let selectedCarId

  const dispatch = createEventDispatcher()


  function handleCarClick (car) {
    dispatch('click', { car })
  }



</script>


<ul>
	{#each cars as car}
		<li
      on:click={() => handleCarClick(car)}
      on:keypress={() => handleCarClick(car)}
      class={selectedCarId===car.id ? 'selected' : null}
    >
      {car.name}
      {#if car.model}
        <Icon name=bookmark></Icon>
      {/if}
      {#if car.trimId}
        {car.trim}
      {/if}
      {#if car.engineId}
        {car.engine.hp}
        {car.engine.name}
      {/if}
    </li>
	{/each}
</ul>

<style>

  .selected {
    color : red;
  }

</style>