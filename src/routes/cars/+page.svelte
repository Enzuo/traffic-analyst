<script>
  import CarsPage from "@/components/pages/CarsPage.svelte"

  export let data

  let selectedCarId = null
  let selectedTrimId = null
  let selectedEngineId = null

  $ : updateParams(data)

  function updateParams(data){
    console.log('update params')
    selectedCarId = data.searchParams.id
    selectedTrimId = data.searchParams.tid
    selectedEngineId = data.searchParams.eid
  }

</script>

<CarsPage selectedCarId={selectedCarId} selectedTrimId={selectedTrimId} selectedEngineId={selectedEngineId}></CarsPage>