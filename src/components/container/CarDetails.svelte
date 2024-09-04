<script>
  import { createEventDispatcher } from "svelte"
  import { getCar, parseDate } from "@/logic/cardata"
  import Icon from "@/components/presentation/Icon.svelte"
  import SceneGraphCar from "./SceneGraphCar.svelte"
  import UPlotGearing from "./UPlotGearing.svelte"
  import UPlotTorque from "./UPlotTorque.svelte"
  import Selector from "@/components/presentation/Selector.svelte";
  import { HistoricPrice, formatPrice } from "@/logic/carLogic/historicPrice"


  export let carId
  export let trimId = 0
  export let configId = 0

  const dispatch = createEventDispatcher()

  let car

  $: loadCar(carId, trimId, configId)


  function loadCar(carId, trimId, configId){
    console.log('trim', typeof trimId, trimId)
    if(carId){
      car = getCar(carId, trimId, configId)
      console.log('got car', car)
    }
    else {
      car = null
    }
  }


  function handleTrimSelect(id) {
    dispatch('select', {
      trimId : id,
      configId : 0,
    })
  }

  function handleConfigSelect(id) {
    dispatch('select', {
      trimId : trimId,
      configId : id,
    })
  }



</script>

<div class="grid">
  <section>
    <h2>{car.brand} - {car.name}</h2>
    <ul>
      <li>{car.brand} - {car.name} - {car.trim}</li>
      <li>{car.year}</li>
      <li>{car.price} - {formatPrice(HistoricPrice(car.price, parseDate(car.year)[0])[0])}$Est</li>
      <li>{car.engine.hp} HP</li>
    </ul>
  </section>
  <SceneGraphCar car={car}></SceneGraphCar>
</div>
<section>
  <div class="grid">
    <Selector elements={car.trims} selectedId={trimId} elementType="trim" on:select={(e) => handleTrimSelect(e.detail.id)}/>
    <Selector elements={car.configs} selectedId={configId} elementType="config" on:select={(e) => handleConfigSelect(e.detail.id)}/>
  </div>
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
    <li>{car.gearbox.gearRatio}</li>
    <li>{car.gearbox.driveRatio} Drive Ratio</li>
    <li>{car.gearbox.gearTransfer ? car.gearbox.gearTransfer[0] : 1} Transfer Ratio</li>
  </ul>
  <UPlotGearing car={car}></UPlotGearing>
  <UPlotGearing car={car} showForce={false}></UPlotGearing>
</section>

<style>
  section {
    margin:1em;
    flex-grow: 1;
  }
</style>