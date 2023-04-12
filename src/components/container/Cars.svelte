<script>
  import * as cardata from '@/logic/cardata'
  import SceneGraph from './SceneGraph.svelte';
  import Icon from '../presentation/Icon.svelte';
  import CarDetails from './CarDetails.svelte';
  let cars = cardata.listCars()

  let selectedCarId

  function handleCarClick (car) {
    selectedCarId = car.id
  }

</script>

<ul>
	{#each cars as car}
		<li on:click={() => handleCarClick(car)}>{car.name}</li>
	{/each}
</ul>

{#if selectedCarId}
  <CarDetails carId={selectedCarId}></CarDetails>
{/if}