<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { GameWorld } from "@/logic/3DsceneGraph/GameWorld/GameWorld"
  import UPlotRealtime from "./UPlotRealtime.svelte";

  let gameWorld : GameWorld
  let elementContainer

  let time = 0

  onMount(() => {

    gameWorld = new GameWorld()
    elementContainer.appendChild(gameWorld.domElement)

    gameWorld.animation.addAnimated({ animate : (delta) => { time += delta }})

  })

  function mstokmh(ms){
    return ms * 3.6
  }

</script>

<div bind:this={elementContainer}/>

{#if gameWorld}
<UPlotRealtime
  title="Speed"
  key="speed"
  transformFn={mstokmh}
  time={time}
  observed={[gameWorld.carEntityControlled]}
></UPlotRealtime>
{/if}