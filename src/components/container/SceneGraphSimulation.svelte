<script>
  import { onMount, onDestroy } from "svelte"
  import SceneGraph from "@/logic/3DsceneGraph/sceneGraph"
  import { createCarEntity } from '@/logic/carLogic/carEntity'

  export let carEntities
  export let simulation
  export let colors

  let sceneGraphContainer
  let sceneGraph

  onMount(() => {
    sceneGraph = SceneGraph(carEntities, simulation, colors)
    sceneGraphContainer.appendChild(sceneGraph.element)

    const width = sceneGraphContainer.clientWidth
    const height = sceneGraphContainer.clientHeight
    console.log(width, height)
    sceneGraph.updateOpts({width : width, height:height})
  })

  onDestroy(() => {
    if(sceneGraph){
      sceneGraph.destroy()
    }
  })

</script>

<div bind:this={sceneGraphContainer}/>