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
      <input name="engine" type="radio" value={index} checked={index===selectedId}>
  </div>
  {/each}
</div>

<style>
  .selected {
    color: var(--primary);
  }

  .grid:focus-within {
    border:1px solid var(--primary)
  }

  input {
    position:absolute;
    left:-9999px;
  }
</style>