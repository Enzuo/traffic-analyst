<script>
  import { SingleCarSceneGraph } from '@/logic/3DsceneGraph/sceneGraph'
  import {createCar} from '@/logic/carLogic/carEntity'
  import * as cardata from '@/logic/cardata'
  import SceneGraph from './SceneGraph.svelte';
  let cars = cardata.listCars()

  let selectedCar

  function handleCarClick (car) {
    console.log(car)
    selectedCar = car
  }

  // $: create3DView(selectedCar)

  // let sceneGraphContainer
  // function create3DView(car) {
  //   console.log('creating 3D view')
  //   if(car){
  //     let carEntity = createCar(car)
  //     sceneGraphContainer.appendChild(SingleCarSceneGraph(carEntity))
  //   }
  // }

</script>


<ul>
	{#each cars as car}
		<li on:click={() => handleCarClick(car)}>{car.name}</li>
	{/each}
  {#if selectedCar}
    SelectedCar : 
    {selectedCar.brand}
    {selectedCar.name}
    {selectedCar.engine.hp}
    <SceneGraph car={selectedCar}></SceneGraph>
  {/if}
</ul>