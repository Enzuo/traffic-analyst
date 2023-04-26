<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"

  export let trims
  export let selectedId

  const dispatch = createEventDispatcher()

  function handleTrimSelect (index) {
    dispatch('select', {
      id : index
    })
  }


</script>

<div class="grid">
  {#each trims as trim, index}
  <div
    class="trim {index===selectedId ? 'selected' : ''}"
    on:click={() => handleTrimSelect(index)}
    on:keydown={() => handleTrimSelect(index)}
  >
    <Icon name=truck></Icon>{trim.trim}
    <input name="trim" type="radio" value={index} checked={index===selectedId}>
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