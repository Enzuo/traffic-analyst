<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"


  export let carsBasket

  let dispatch = createEventDispatcher()

  let reversedCarBasket
  $ : reversedCarBasket = [...carsBasket].reverse()

  function handleAddToBasket () {
    dispatch('addToBasket')
  }

  function handleCompare () {
    dispatch('compareBasket')
  }
</script>



<div class="basket">
  {#each reversedCarBasket as car }
    <button class="secondary">
      <div class="name">{car.name}</div>
      <div class="hp">{car.engine.hp}</div>
    </button>
  {/each}
  <button on:click={handleAddToBasket}>Add</button>
  <button on:click={handleCompare}><Icon name="stats-dots"></Icon></button>
</div>

<style>

  .basket {
    display: flex;
    justify-content: end;
    grid-gap: 10px;
    /* direction: rtl; */
    /* flex-direction: row-reverse; */
  }

  .car {
    flex: none;
    align-self: stretch;
    font-family:'Publicpixel';
    border: 1px solid var(--secondary);
    margin:5px;
  }

  button {
    display: inline-block;
  }


</style>