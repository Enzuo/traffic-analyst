<script>
  import { onMount, onDestroy } from "svelte"
  import { GameWorld } from "@/logic/3DsceneGraph/GameWorld"

  let gameWorld
  let elementContainer

  onMount(() => {

    gameWorld = new GameWorld()
    elementContainer.appendChild(gameWorld.domElement)



  })

</script>

<div bind:this={elementContainer}/>
