<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  interface $$Events {
    select: CustomEvent<String>
  }

  export let options = ['name']
  export let currentSort = 'name'

  $: currentSortIndex = options.findIndex(opt => opt === currentSort)
  let dispatch = createEventDispatcher()

  function handleClick() {
    currentSortIndex++
    if (currentSortIndex >= options.length) {
      currentSortIndex = 0
    }

    dispatch('select', options[currentSortIndex])
  }
</script>

<div on:click={handleClick}>
  Sort by {currentSort}
</div>
