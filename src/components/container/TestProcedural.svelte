<script>
  import { getCar } from "@/logic/cardata";
  import SceneGraph from "./SceneGraph.svelte";

  let car = getCar('volkswagen_kombi')





</script>

<SceneGraph car={car}></SceneGraph>

<ul>
  <li>Wheelbase : <input bind:value={car.wheelbase}/></li>
  <li>Length : <input bind:value={car.length}/></li>
  <li>Width : <input bind:value={car.width}/></li>
  <li>Height : <input bind:value={car.height}/></li>
  <li>Clearance : <input bind:value={car.clearance}/></li>
  <li>Wheel size : <input bind:value={car.wheelDiameter}></li> 
  <li>Body type : <input bind:value={car.bodyType}/> (Bus, Van, Hatchback, Sedan, Monospace, Box)</li> 
  {car.length}
</ul>

