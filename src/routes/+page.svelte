<script lang="ts">
  import { version } from '$app/environment'

  import Tools from '@/components/tools/Tools.svelte'
  import TrafficSim from '@/components/container/TrafficSim.svelte'
  import TestProcedural from '@/components/tools/TestProcedural.svelte';
  import TrafficSimPixelBanner from '@/components/container/TrafficSimPixelBanner.svelte'
  import createTrafficSimulation from '@/logic/trafficsim/trafficSimulation'
  import { onMount } from 'svelte'

  let simulation = createTrafficSimulation()

  onMount(() => {
    simulation.start()
  })
</script>

<main>
  <TrafficSim traffic_sim={simulation}></TrafficSim>
  <TrafficSimPixelBanner traffic_sim={simulation}></TrafficSimPixelBanner>
  <h1>
    <img src="title7.png" alt="AutoWaves"/>
  </h1>
  <div id="tools">
    <Tools></Tools>
  </div>
  <div id="menu">
    <a class="button" href="cars">cars list</a>
    <a class="button" href="about">about</a>
  </div>
  <div id="footer">
    v {version}
  </div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		/* max-width: 240px; */
		margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
	}

  #tools {
    width: 100%;
    display:none;
  }

  .button {
    box-shadow: 1px 1px 0px 2px var(--secondary);
    margin:1.5em;
  }

  #footer {
    color:var(--secondary);
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