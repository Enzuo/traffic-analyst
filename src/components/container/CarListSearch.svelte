<script>
  import { createEventDispatcher } from 'svelte'
  import Icon from '@/components/presentation/Icon.svelte'
  import SearchBar from './SearchBar.svelte'
  import CarList from '@/components/presentation/CarList.svelte'
  import SortSelector from './SortSelector.svelte'
  import { parseDate } from "@/logic/lib/dataParser"
  import { HistoricPrice } from '@/logic/lib/historicPrice'

  export let cars=[]
  export let selectedCarId=null

  let sortOptions = ['name', 'year', 'price', 'size']
  let sortBy = sortOptions[0]

  const dispatch = createEventDispatcher()

  $: sortFn = getSortFn(sortBy)
  $: carsSorted = cars.toSorted(sortFn)

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
        let aNormalizedPrice = HistoricPrice(a.price, parseDate(a.year)[0])[0]
        let bNormalizedPrice = HistoricPrice(b.price, parseDate(b.year)[0])[0]
        // unknown price -> sort at the end
        if(!aNormalizedPrice) return 1
        if(!bNormalizedPrice) return -1
        return  aNormalizedPrice - bNormalizedPrice
      }
    }

    if(sortBy === 'size'){
      return (a, b) => {
        let aSize = a.length + a.width + a.height
        let bSize = b.length + b.width + b.height
        return aSize - bSize
      }
    }
  }

</script>


<SearchBar on:search ></SearchBar>
<SortSelector options={sortOptions} currentSort={sortBy} on:select={handleSortSelect}></SortSelector>
<CarList cars={carsSorted} selectedCarId={selectedCarId} on:click={handleCarClick}></CarList>