<script>
  import { createEventDispatcher } from "svelte"
  import { getCar } from "@/logic/cardata"
  import Icon from "@/components/presentation/Icon.svelte"
  import SceneGraphCar from "./SceneGraphCar.svelte"
  import UPlotGearing from "./UPlotGearing.svelte"
  import UPlotTorque from "./UPlotTorque.svelte"
  import Selector from "@/components/presentation/Selector.svelte";


  export let carId
  export let trimId = 0
  export let engineId = 0

  const dispatch = createEventDispatcher()

  let car

  $: loadCar(carId, trimId, engineId)


  function loadCar(carId, trimId, engineId){
    console.log('trim', typeof trimId, trimId)
    if(carId){
      car = getCar(carId, trimId, engineId)
    }
    else {
      car = null
    }
  }



  function handleTrimSelect(id) {
    dispatch('select', {
      trimId : id,
      engineId : 0,
    })
  }

  function handleEngineSelect(id) {
    dispatch('select', {
      trimId : trimId,
      engineId : id,
    })
  }



</script>

<div class="grid">
  <section>
    <h2>{car.brand} - {car.name}</h2>
    <ul>
      <li>{car.brand} - {car.name} - {car.trim}</li>
      <li>{car.year}</li>
      <li>{car.price}</li>
      <li>{car.engine.hp} HP</li>
    </ul>
  </section>
  <SceneGraphCar car={car}></SceneGraphCar>
</div>
<section>
  <Selector elements={car.trims} selectedId={trimId} elementType="trim" on:select={(e) => handleTrimSelect(e.detail.id)}/>
  <Selector elements={car.engines} selectedId={engineId} elementType="engine" on:select={(e) => handleEngineSelect(e.detail.id)}/>
</section>



<section>
  <h3>Dimensions</h3>
  <ul>
    <li>{car.length} mm</li>
    <li>{car.width} mm</li>
    <li>{car.height} mm</li>
    <li>{car.wheelbase} mm</li>
    <li>{car.weight} KG</li>
  </ul>
</section>

<section>
  <h3>Engine</h3>
  <li>{car.engine.hp} HP</li>
  <UPlotTorque cars={[car]}></UPlotTorque>
</section>

<section>
  <h3>Transmission</h3>
  <ul>
    <li>{car.gearRatio}</li>
    <li>{car.driveRatio} Drive Ratio</li>
    <li>{car.gearTransfer ? car.gearTransfer[0] : 1} Transfer Ratio</li>
  </ul>
  <UPlotGearing car={car}></UPlotGearing>
</section>

<style>
  section {
    margin:1em;
    flex-grow: 1;
  }
</style>