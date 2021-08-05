<script lang="ts">
  import { onMount } from "svelte"
  import { SVG } from '@svgdotjs/svg.js'
  import { watchResize } from "svelte-watch-resize"


  export let road
  export let onCarClick = (id) => { console.log('click car', id)}

  let carBoxes = {}
  let scale = 3
  let container
  let svggraph
  let selectedId = null


  function animate () {
    road.getState().cars.forEach((car) => {
      let carBox = carBoxes[car.id]

      if(!carBox){
        carBox = carBoxes[car.id] = svggraph.rect(4.1*scale, 1.8*scale).stroke('#000').fill({ color: 'red' })
        carBox.click(function() {
          selectedId = car.id
          onCarClick(car.id)
          carBox.fill({ color: 'yellow' })
        })
      }

      // variable color
      console.log()
      if(car.id !== selectedId){
        let red = Math.floor(255 * car.state.throttle)
        let green = 255 - Math.floor(255 * car.state.throttle)
        carBox.fill({ color: 'rgb('+ red +',' + green +',0)' })
      }

      carBox.move(car.position*scale, 5)
    })
  }

  const handleResize = () => {
    let canvasWidth = container.offsetWidth
    let canvasHeight = container.offsetHeight
    svggraph.size(canvasWidth, canvasHeight)
  }

  onMount(() => {
    let canvasWidth = container.offsetWidth
    let canvasHeight = container.offsetHeight
    svggraph = SVG().addTo(container).size(canvasWidth, canvasHeight)


    let cancelLoopHandler
    const runLoop = (t) => {
      cancelLoopHandler = window.requestAnimationFrame(runLoop)
      animate()
    }
    setTimeout(() => {
      cancelLoopHandler = window.requestAnimationFrame(runLoop)
    }, 500)
  })

</script>

<style>
	.graph { width: 100%; height: 200px; }
</style>

<div class="graph" bind:this={container} use:watchResize={handleResize}/> 
