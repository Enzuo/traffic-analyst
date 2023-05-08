<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "./Icon.svelte"


  export let cars
  export let selectedCarId

  const dispatch = createEventDispatcher()


  function handleCarClick (car, e) {
    e.preventDefault()
    dispatch('click', { car })
  }



</script>


<ul>
	{#each cars as car}
		<li><a href="#"
      on:click={(e) => handleCarClick(car, e)}
      on:keypress={(e) => handleCarClick(car, e)}
      class={selectedCarId===car.id ? 'neutral selected' : 'neutral'}
    >
      {car.brand} {car.name}
      {#if car.model}
        <Icon name=bookmark></Icon>
      {/if}
      {#if car.trimId}
        {car.trim}
      {/if}
      {#if car.engineId && car.engine}
        {car.engine.hp}
        {car.engine.name}
      {/if}
    </a></li>
	{/each}
</ul>

<style>

  .selected {
    color : var(--primary)
  }

</style>