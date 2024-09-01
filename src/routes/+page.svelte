<script lang="ts">
  import { version } from '$app/environment'

  import Tools from '@/components/tools/Tools.svelte'
  import TrafficSim from '@/components/container/TrafficSim.svelte'
  import Article from '@/components/presentation/Article.svelte'
  import TestProcedural from '@/components/tools/TestProcedural.svelte'
  import TrafficSimPixelBanner from '@/components/container/TrafficSimPixelBanner.svelte'
  import createTrafficSimulation from '@/logic/trafficsim/trafficSimulation'
  import { onMount, onDestroy } from 'svelte'
  import DebugPerformanceGraph from '@/debug/performance/DebugPerformanceGraph.svelte'
  import BackgroundCanvas from '@/components/container/BackgroundCanvas.svelte'

  export let data

  let simulation = createTrafficSimulation()
  let debugPerf

  onMount(() => {
    simulation.start()
    debugPerf = simulation.debug.perf
  })

  onDestroy(() => {
    if (simulation) {
      simulation.stop()
    }
  })
</script>

<main>
  <TrafficSimPixelBanner traffic_sim={simulation}></TrafficSimPixelBanner>
  <DebugPerformanceGraph {debugPerf} top="130px"></DebugPerformanceGraph>
  <div class="app-title">
    <h1>
      <img src="title8.png" alt="AutoWaves" />
    </h1>
  </div>
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
  <div id="articles">
    {#each data.articles as article}
      <Article {...article.frontmatter}>
        {@html article.content}
      </Article>
    {/each}
  </div>
  <BackgroundCanvas></BackgroundCanvas>
</main>

<style>
  main {
    /* text-align: center; */
    /* max-width: 240px; */
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }

  #tools {
    width: 100%;
    display: none;
  }

  .button {
    box-shadow: 1px 1px 0px 2px var(--secondary);
    margin: 1.5em;
  }

  #footer {
    color: var(--secondary);
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  .app-title {
    width: 100%;
    position: absolute;
    top: 75px;
    text-align: center;
  }

  h1 img {
    width: 448px;
    max-width:100%;
    image-rendering: pixelated;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  h1 {
    color: #a2ded0; /* Mint Green */
    color: #f7a9a8; /* Rose Pink*/
    color: #f8e9a1; /* Pale Yellow*/

    color: #ffa7c4;
    color: #c3ffb5;
    color: #e5f6ff;
    color: #c2d8f9;
    color: #5f5aa2;
    color: #fff7de;
  }

</style>
