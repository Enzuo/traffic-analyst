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
  function handleClick(car, e){
    e.preventDefault()
    dispatch('click', {
      id : car.id,
      trimId : car.trimId,
      engineId : car.engineId,
    })
  }
</script>



<div class="basket-bar">
  <ul>
  {#each reversedCarBasket as car }
    <li>
      <a href="#" on:click={(e) => handleClick(car, e)} title={`${car.brand} ${car.name} - ${car.engine.hp}hp`}>
        <div class="name">{car.name}</div>
        <div class="hp">{car.engine.hp}</div>
      </a>
    </li>
  {/each}
  </ul>
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

  li {
    display: inline-block;
    /* border-left:3px solid var(--secondary); */
    /* margin:0; */
  }


</style>