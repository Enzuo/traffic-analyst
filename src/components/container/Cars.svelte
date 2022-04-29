<script>
  import * as cardata from '@/logic/cardata'
  let cars = cardata.listCars()

</script>

<ul>
	{#each cars as car}
		<li>{car.name}</li>
	{/each}
</ul>