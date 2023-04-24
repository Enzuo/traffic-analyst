<script>
  import LayoutList from "@/components/layout/LayoutList.svelte"
  import * as cardata from '@/logic/cardata'
  import CarList from '@/components/container/CarList.svelte'
  import CarDetails from '@/components/container/CarDetails.svelte'


  let cars = cardata.listCars()
  let selectedCarId

  function handleListClick (e) {
    selectedCarId = e.detail.id
  }


</script>
<div class="page">
  <LayoutList>
    <div slot="list">
      <CarList cars={cars} on:click={handleListClick}></CarList>
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
    height:100vh;
  }
</style>