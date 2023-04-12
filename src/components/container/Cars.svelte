<script>
  import * as cardata from '@/logic/cardata'
  import SceneGraph from './SceneGraph.svelte';
  import Icon from '../presentation/Icon.svelte';
  import CarDetails from './CarDetails.svelte';
  let cars = cardata.listCars()

  let selectedCar
  let selectedCarTrims 

  function handleCarClick (car) {
    let carTrims = cardata.getCarTrims(car.id)
    selectedCar = carTrims[0]
    selectedCarTrims = carTrims
  }

</script>

<ul>
	{#each cars as car}
		<li on:click={() => handleCarClick(car)}>{car.name}</li>
	{/each}
</ul>

{#if selectedCarTrims}
  <CarDetails carWithTrims={selectedCarTrims}></CarDetails>
{/if}