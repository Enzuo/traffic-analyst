<script lang="ts">
  import { onMount } from "svelte"
  import { SVG, PathArray } from '@svgdotjs/svg.js'

  export let getData : () => [number, number] 

  let container
  onMount(() => {

    var draw = SVG().addTo(container).size('100%', '100%')
    // draw.attr('height', '100%')
    // draw.attr('width', '100%')
    // var rect = draw.rect(100, 100).attr({ fill: '#f06' })
    // let path = draw.path([ 'M', 0, 0, 'L', 100, 100, 'z' ]).attr({ stroke: '#f06' })
    // path.


    let dataPts = []
    const update = () => {
      if(!getData) return
      draw.clear()

      let [x, y] = getData()
      x /= 250 
      dataPts.push({x, y})

      let pathData = ['M', 0, 0]
      pathData = dataPts.reduce((arr, pt) => arr.concat(['L', pt.x, pt.y]), pathData)
      // pathData.push('z')
      // console.log(pathData)
      let path = draw.path(pathData).attr({ fill: 'none', stroke: '#f06' })
      path.move(300-x, 0)

      // let rect = draw.rect(1, y).attr({ fill: '#f06' })
      // rect.move(x, 100)
    }
  
    setInterval(update, 250)
  });

</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph" bind:this={container} /> 