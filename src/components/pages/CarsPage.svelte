<script>
  import * as cardata from '@/logic/cardata'
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import CarListSearch from '@/components/container/CarListSearch.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'
  import { createEventDispatcher } from 'svelte'
  import CarBasket from '@/components/container/CarBasket.svelte';

  export let selectedCarId = null
  export let selectedTrimId = null
  export let selectedConfigId = null

  let cars = cardata.listCars()
  let carsBasket = []

  let dispatch = createEventDispatcher()

  function handleListSelect (e) {
    dispatch('carSelect', {
      id : e.detail.id,
      trimId : e.detail.trimId,
      configId : e.detail.configId,
    })
  }

  function handleContentSelect (e) {
    dispatch('contentSelect', {
      id : selectedCarId,
      trimId : e.detail.trimId,
      configId : e.detail.configId,
    })
  }

  function handleSearch(e) {
    let searchText = e.detail.searchText
    if(!searchText){
      cars = cardata.listCars()
      return
    }
    cars = cardata.searchCar(searchText)
    console.log('searched', cars)
  }

  function handleCompare(){
    let carsToCompare = [{id : selectedCarId, trimId: selectedTrimId, configId: selectedConfigId}]
    if(carsBasket.length){
      carsToCompare =  carsBasket.map(c => ({
        id : c.id,
        trimId : c.trimId,
        configId : c.configId,
      }))
    }
    dispatch('compare', {
      cars : carsToCompare
    })
  }

  function handleAddToBasket () {
    let car = cardata.getCar(selectedCarId, selectedTrimId, selectedConfigId)
    if(carsBasket.findIndex((c) => {
      return c.id === selectedCarId && c.trimId === selectedTrimId && c.configId === selectedConfigId
    }) < 0){
      carsBasket = carsBasket.concat(car)
    }
  }

  function handleBasketClick(e) {
    if(e.detail.id !== selectedCarId){
      dispatch('carSelect', {
        id : e.detail.id,
        trimId : e.detail.trimId,
        configId : e.detail.configId,
      })
    }
  }

</script>


<div class="page">
  <LayoutList>
    <div slot="side-bar">
      <CarBasket
        carsBasket={carsBasket}
        on:addToBasket={handleAddToBasket}
        on:compareBasket={handleCompare}
        on:click={handleBasketClick}
      ></CarBasket>
    </div>

    <div slot="list">
      <CarListSearch cars={cars} selectedCarId={selectedCarId} on:select={handleListSelect} on:search={handleSearch}></CarListSearch>
    </div>

    <div slot="content">
      {#if selectedCarId}
        <CarDetails
          carId={selectedCarId}
          trimId={selectedTrimId}
          configId={selectedConfigId}
          on:select={handleContentSelect}
        >
        </CarDetails>
      {/if}
    </div>
  </LayoutList>
</div>


<style>
  .page {
    height:100vh;
  }
</style>