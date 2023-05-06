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



<div class="basket-bar">
  {#each reversedCarBasket as car }
    <a href="#" class="button secondary">
      <div class="name">{car.name}</div>
      <div class="hp">{car.engine.hp}</div>
    </a>
  {/each}
  <button on:click={handleAddToBasket}>Add</button>
  <button on:click={handleCompare}><Icon name="stats-dots"></Icon></button>
</div>

<style>

  .basket-bar {
    display: flex;
    justify-content: end;
    /* grid-gap: 10px; */
    border-bottom: 3px solid var(--secondary);
    /* direction: rtl; */
    /* flex-direction: row-reverse; */
  }

  .car {
    flex: none;
    align-self: stretch;
    font-family:'Publicpixel';
    border: 3px solid var(--secondary);
    margin:5px;
  }

  button {
    display: inline-block;
    /* border-left:3px solid var(--secondary); */
    /* margin:0; */
  }


</style>