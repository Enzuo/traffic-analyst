<script>
  import { createEventDispatcher } from 'svelte'
  import Icon from '@/components/presentation/Icon.svelte'
  import SearchBar from './SearchBar.svelte';

  export let cars=[]
  export let selectedCarId=null

  const dispatch = createEventDispatcher()


  function handleCarClick (car) {
    selectedCarId = car.id
    dispatch('select', {
      id : car.id,
    })
  }

</script>


<SearchBar on:search ></SearchBar>

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
    </li>
	{/each}
</ul>

<style>

  .selected {
    color : red;
  }

</style>