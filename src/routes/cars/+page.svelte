<script>
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import * as cardata from '@/logic/cardata'
  import CarList from '@/components/container/CarList.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'
  import { goto } from "$app/navigation";

  export let data

  let cars = cardata.listCars()
  let selectedCarId = null

  $ : updateParams(data)

  function updateParams(data){
    selectedCarId = data.searchParams.id || null
  }

  function handleListClick (e) {
    // selectedCarId = e.detail.id

    goto('/cars?id='+e.detail.id, {invalidateAll:false, noScroll:true})
  }




</script>
<div class="page">
  <LayoutList>
    <div slot="list">
      <CarList cars={cars} selectedCarId={selectedCarId} on:click={handleListClick}></CarList>
    </div>

    <div slot="content">
      {#if selectedCarId}
        <CarDetails carId={selectedCarId}></CarDetails>
      {/if}
    </div>
  </LayoutList>
</div>

<style>
  .page {
    min-height:100vh;
  }
</style>