<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"

  export let elements
  export let elementType
  export let selectedId

  const dispatch = createEventDispatcher()

  function handleElementSelect (index) {
    dispatch('select', {
      id : index
    })
  }


</script>

<div class="grid">
  {#each elements as element, index}
  <div
    class="trim {index===selectedId ? 'selected' : ''}"
    on:click={() => handleElementSelect(index)}
    on:keydown={() => handleElementSelect(index)}
  >
    {#if elementType === 'engine'}
      <Icon name=cog></Icon>{element.engine.name} {element.engine.hp} {element.gearName}
    {:else if elementType === 'trim'}
      <Icon name=truck></Icon>{element.trim}
    {:else}
      {element.name}
    {/if}
    <input name={elementType} type="radio" value={index} checked={index===selectedId}>

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