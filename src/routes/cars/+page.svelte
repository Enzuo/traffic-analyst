<script>
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import * as cardata from '@/logic/cardata'
  import CarList from '@/components/container/CarList.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'
  import { goto } from "$app/navigation";

  export let data

  let cars = cardata.listCars()
  let selectedCarId = null
  let selectedTrimid = null
  let selectedEngineid = null

  $ : updateParams(data)

  function updateParams(data){
    selectedCarId = data.searchParams.id
    selectedTrimid = data.searchParams.tid
    selectedEngineid = data.searchParams.eid
  }

  function handleListClick (e) {
    let params = new URLSearchParams({
      id : e.detail.id,
    })

    goto('/cars?'+params, {invalidateAll:false, noScroll:true})
  }


  function handleContentSelect (e) {
    let params = new URLSearchParams({
      id : selectedCarId,
      tid : e.detail.trim,
      eid : e.detail.engine,
    })

    // don't keep content change in history with replaceState:true
    goto('/cars?'+params, {replaceState:true, noScroll:true})
  }



</script>
<div class="page">
  <LayoutList>
    <div slot="list">
      <CarList cars={cars} selectedCarId={selectedCarId} on:click={handleListClick}></CarList>
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