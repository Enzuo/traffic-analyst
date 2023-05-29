<script>
  import { onMount, onDestroy } from "svelte"
  import { SceneGraph } from "@/logic/3DsceneGraph/SceneGraph"

  export let carEntities
  export let simulation
  export let colors

  let sceneGraphContainer
  let sceneGraph

  onMount(() => {
    sceneGraph = new SceneGraph(carEntities, simulation, colors)
    sceneGraphContainer.appendChild(sceneGraph.domElement)

    const width = sceneGraphContainer.clientWidth
    const height = sceneGraphContainer.clientHeight
    sceneGraph.updateSceneOpts({width : width, height:height})
  })

  onDestroy(() => {
    if(sceneGraph){
      sceneGraph.destroy()
    }
  })

</script>

<div bind:this={sceneGraphContainer}/>