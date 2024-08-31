<script>
  import { createEventDispatcher } from 'svelte'
  import Icon from '@/components/presentation/Icon.svelte'
  import SearchBar from './SearchBar.svelte'
  import CarList from '@/components/presentation/CarList.svelte'
  import SortSelector from './SortSelector.svelte'
  import { parseDate } from '@/logic/cardata'

  export let cars=[]
  export let selectedCarId=null

  let sortOptions = ['name', 'year', 'price']
  let sortBy = sortOptions[0]

  const dispatch = createEventDispatcher()

  $: sortFn = getSortFn(sortBy)
  $: carsSorted = cars.toSorted(sortFn)
  $: foo = "hello" + sortFn


  function handleCarClick (e) {
    let car = e.detail.car
    selectedCarId = car.id

    dispatch('select', {
      id : car.id,
      trimId : car.trimId,
      configId : car.configId,
    })
  }

  function handleSortSelect(event) {
    console.log(event)
    sortBy = event.detail
  }

  // Utils

  function getSortFn(sortBy){
    console.log('getSortFn', sortBy)
    if(sortBy === 'name'){
      return (a, b) => {
        return a.name - b.name
      }
    }

    if(sortBy === 'year'){
      return (a, b) => {
        return parseDate(a.year)[0] - parseDate(b.year)[0]
      }
    }

    if(sortBy === 'price'){
      return (a, b) => {
        return a.price - b.price
      }
    }
  }

</script>


<SearchBar on:search ></SearchBar>
<SortSelector options={sortOptions} currentSort={sortBy} on:select={handleSortSelect}></SortSelector>
{foo}
<CarList cars={carsSorted} selectedCarId={selectedCarId} on:click={handleCarClick}></CarList>