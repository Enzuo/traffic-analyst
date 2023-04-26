<script lang="ts">
  import Cars from '@/components/container/Cars.svelte'
  import Car from '@/components/container/Car.svelte'
  import Tools from '@/components/tools/Tools.svelte'
  import TrafficSim from '@/components/container/TrafficSim.svelte'
  import TestProcedural from '@/components/tools/TestProcedural.svelte';
</script>

<main>
  <h1>
    <img src="title7.png" alt="AutoWaves"/>
  </h1>
  <Tools></Tools>
  <Cars/>
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
  h1 {
    color: #A2DED0; /* Mint Green */
    color: #F7A9A8; /* Rose Pink*/
    color: #F8E9A1; /* Pale Yellow*/

    color:#FFA7C4 ;
    color:#C3FFB5 ;
    color:#E5F6FF;
    color:#C2D8F9 ;
    color:#5F5AA2 ;
    color :#fff7de;
  }

  h1 img {
    width:300px;
    image-rendering: pixelated;
  }
</style>