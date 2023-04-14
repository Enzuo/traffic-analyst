<script>
  import { onMount } from "svelte"
  import { SingleCarSceneGraph } from "@/logic/3DsceneGraph/sceneGraph"
  import { createCarEntity } from '@/logic/carLogic/carEntity'
  
  export let car

  let sceneGraphContainer
  let sceneGraph
  
  onMount(() => {
    let carEntity = createCarEntity(car)
    sceneGraph = SingleCarSceneGraph(carEntity)
    sceneGraphContainer.appendChild(sceneGraph.element)
  })

  $ : updateGraph(car)

  function updateGraph(car){
    // TODO might want to delete this confusion between car and carEntity, merge the 2
    let carEntity = createCarEntity(car)
    if(sceneGraph){
      sceneGraph.updateData(carEntity)
    }
  }
</script>

<div bind:this={sceneGraphContainer}/>
