<script>
  import Icon from "@/components/presentation/Icon.svelte"
  import { createEventDispatcher } from "svelte"


  const dispatch = createEventDispatcher()
  let placeholder='clio 2 90cv 2003'

  let searchText

  function handleSubmit(e){
    e.preventDefault()
    dispatch('search', {
      searchText
    })
  }

</script>

<form>

  <input type="search" bind:value={searchText} placeholder={placeholder}/>
  <button type="submit" on:submit={handleSubmit} on:click={handleSubmit}>
    Search
    <Icon name="search"></Icon>
  </button>
</form>