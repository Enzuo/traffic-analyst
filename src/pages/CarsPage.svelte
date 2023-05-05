<script>
  import * as cardata from '@/logic/cardata'
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import CarList from '@/components/container/CarList.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'
  import { goto } from "$app/navigation"
  import CarBasket from '@/components/container/CarBasket.svelte';

  export let selectedCarId = null
  export let selectedTrimId = null
  export let selectedEngineId = null

  let cars = cardata.listCars()
  let carsBasket = []

  function handleListSelect (e) {
    let paramsObj = {id : e.detail.id}
    if(e.detail.trimId){
      paramsObj.tid = e.detail.trimId
    }
    if(e.detail.engineId){
      paramsObj.eid = e.detail.engineId
    }
    // TODO extract goto to routes
    let params = new URLSearchParams(paramsObj)

    goto('/cars?'+params, {invalidateAll:false, noScroll:true})
  }

  function handleContentSelect (e) {
    let params = new URLSearchParams({
      id : selectedCarId,
      tid : e.detail.trim,
      eid : e.detail.engine,
    })

    // don't keep content change in history with replaceState:true
    goto('/cars?'+params, {replaceState:true, noScroll:true, keepFocus:true})
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
    let searchParams = carsBasket.map(c => {
      return ['id', c.id]
    })
    let params = new URLSearchParams(searchParams)

    goto('/compare?'+params)
  }

  function handleAddToBasket () {
    let car = cardata.getCar(selectedCarId, selectedTrimId, selectedEngineId)
    if(carsBasket.findIndex((c) => {
      return c.id === selectedCarId && c.trimId === selectedTrimId && c.engineId === selectedEngineId
    }) < 0){
      carsBasket = carsBasket.concat(car)
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
      ></CarBasket>
    </div>

    <div slot="list">
      <CarList cars={cars} selectedCarId={selectedCarId} on:select={handleListSelect} on:search={handleSearch}></CarList>
    </div>

    <div slot="content">
      {#if selectedCarId}
        <CarDetails
          carId={selectedCarId}
          trimId={selectedTrimId}
          engineId={selectedEngineId}
          on:select={handleContentSelect}
        >
        </CarDetails>
      {/if}
    </div>
  </LayoutList>
</div>


<style>
  .page {
    min-height:100vh;
  }
</style>