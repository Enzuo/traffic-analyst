<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"
  import QtyUnit from "./QtyUnit.svelte"


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
      configId : car.configId,
    })
  }
</script>



<div class="basket-bar">
  <ul>
  {#each reversedCarBasket as car (car.id + car.configId + car.trimId)}
    <li>
      <a href="#" on:click={(e) => handleClick(car, e)} title={`${car.brand} ${car.name} - ${car.engine.hp}hp`}>
        <div class="name">{car.name}</div>
        <div class="hp">
          {#if car.engine.power}
            <QtyUnit value={car.engine.power} unit='hp' precision={0}></QtyUnit>
          {:else}
            {car.engine.hp}
          {/if}
        </div>
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
    border-bottom: 2px solid var(--primary);
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