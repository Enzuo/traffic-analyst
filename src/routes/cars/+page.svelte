<script>
  import { goto } from "$app/navigation"
  import CarsPage from "@/components/pages/CarsPage.svelte"

  export let data

  let selectedCarId = null
  let selectedTrimId = null
  let selectedConfigId = null

  $ : updateParams(data)

  function updateParams(data){
    console.log('update params', data)
    selectedCarId = data.searchParams.id
    selectedTrimId = data.searchParams.tid
    selectedConfigId = data.searchParams.cid
  }

  function handleCarSelect(e){
    let paramsObj = {id : e.detail.id}
    if(e.detail.trimId){
      paramsObj.tid = e.detail.trimId
    }
    if(e.detail.configId){
      paramsObj.cid = e.detail.configId
    }
    let params = new URLSearchParams(paramsObj)

    goto('cars?'+params, {invalidateAll:false, noScroll:true, keepFocus:true})
  }

  function handleContentSelect(e){
    let params = new URLSearchParams({
      id : selectedCarId,
      tid : e.detail.trimId,
      cid : e.detail.configId,
    })

    // don't keep content change in history with replaceState:true
    goto('cars?'+params, {replaceState:true, noScroll:true, keepFocus:true})
  }

  function handleCompare(e){
    const {cars} = e.detail
    let searchParams = cars.reduce((params, c) => {
      params.push(['id', c.id])
      params.push(['tid', c.trimId])
      params.push(['cid', c.configId])
      return params
    }, [])
    console.log(searchParams)
    let params = new URLSearchParams(searchParams)

    goto('compare?'+params)
  }



</script>

<CarsPage
  selectedCarId={selectedCarId}
  selectedTrimId={selectedTrimId}
  selectedConfigId={selectedConfigId}
  on:carSelect={handleCarSelect}
  on:contentSelect={handleContentSelect}
  on:compare={handleCompare}
></CarsPage>