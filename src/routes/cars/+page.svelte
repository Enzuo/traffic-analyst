<script>
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import * as cardata from '@/logic/cardata'
  import CarList from '@/components/container/CarList.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'
  import { goto } from "$app/navigation"

  export let data

  let cars = cardata.listCars()
  let selectedCarId = null
  let selectedTrimid = null
  let selectedEngineid = null

  $ : updateParams(data)

  function updateParams(data){
    console.log('update params')
    selectedCarId = data.searchParams.id
    selectedTrimid = data.searchParams.tid
    selectedEngineid = data.searchParams.eid
  }

  function handleListSelect (e) {
    let paramsObj = {id : e.detail.id}
    if(e.detail.trimId){
      paramsObj.tid = e.detail.trimId
    }
    if(e.detail.engineId){
      paramsObj.eid = e.detail.engineId
    }
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
    let params = new URLSearchParams([
      ['id', 'test1'],
      ['id', 'test2'],
    ])

    goto('/compare?'+params)
  }



</script>
<div class="page">
  <LayoutList>
    <div slot="list">
      <CarList cars={cars} selectedCarId={selectedCarId} on:select={handleListSelect} on:search={handleSearch}></CarList>
      <button on:click={handleCompare}>goto compare</button>
    </div>

    <div slot="content">
      {#if selectedCarId}
        <CarDetails
          carId={selectedCarId}
          trimId={selectedTrimid}
          engineId={selectedEngineid}
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