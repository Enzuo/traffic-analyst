<script lang="ts">
  import Cars from '@/components/container/Cars.svelte'
  import Car from '@/components/container/Car.svelte'
  import Simulation from '@/components/container/Simulation.svelte'
</script>

<main>
  <Car/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>