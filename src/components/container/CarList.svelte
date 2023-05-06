<script>
  import { createEventDispatcher } from 'svelte'
  import Icon from '@/components/presentation/Icon.svelte'
  import SearchBar from './SearchBar.svelte'
  import CarList from '@/components/presentation/CarList.svelte'

  export let cars=[]
  export let selectedCarId=null

  const dispatch = createEventDispatcher()


  function handleCarClick (e) {
    let car = e.detail.car
    selectedCarId = car.id

    dispatch('select', {
      id : car.id,
      trimId : car.trimId,
      engineId : car.engineId,
    })
  }

</script>


<SearchBar on:search ></SearchBar>
<CarList cars={cars} selectedCarId={selectedCarId} on:click={handleCarClick}></CarList>