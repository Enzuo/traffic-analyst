<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"

  export let engines
  export let selectedId

  const dispatch = createEventDispatcher()

  function handleEngineSelect (index) {
    dispatch('select', {
      id : index
    })
  }


</script>

<div class="grid">
  {#each engines as engine, index}
  <div
    class="trim {index===selectedId ? 'selected' : ''}"
    on:click={() => handleEngineSelect(index)}
    on:keydown={() => handleEngineSelect(index)}
  >
      <Icon name=cog></Icon>{engine.engine.name} {engine.engine.hp} {engine.gearName}
  </div>
  {/each}
</div>

<style>
  .selected {
    color: var(--primary);
  }
</style>