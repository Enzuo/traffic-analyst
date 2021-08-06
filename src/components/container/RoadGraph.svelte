<script lang="ts">
  import { onMount } from "svelte"
  import { SVG } from '@svgdotjs/svg.js'
  import { watchResize } from "svelte-watch-resize"


  export let road
  export let onCarClick = (id) => { console.log('click car', id)}

  let carEntities = {}
  let scale = 3
  let container
  let svggraph
  let selectedId = null


  function animate () {
    road.getState().cars.forEach((car) => {
      let carEntity = carEntities[car.id]

      if(!carEntity){
        const circleSize = 10
        const carLength = 4.1
        const carWidth = 1.8
        
        let group = svggraph.group()
        let selectCircle = group.circle(circleSize * scale)
          .stroke('none').fill({ color: 'red' })
          .move(-circleSize/2 * scale,-circleSize/2 * scale)
        let carBox = group.rect(carLength * scale, carWidth * scale)
          .stroke('#000').fill({ color: 'red' })
          .move(-carLength/2 * scale, -carWidth/2 * scale)

        group.click(function() {
          selectedId = car.id
          onCarClick(car.id)
          selectCircle.fill({ color: 'rgba(255, 255, 0, 0.30)' })
        })

        carEntity = carEntities[car.id] = {group, carBox, selectCircle}
      }

      // variable color
      let red = 125 + Math.floor(125 * car.state.brake)
      let green = 125 + Math.floor(255 * car.state.throttle)
      carEntity.carBox.fill({ color: 'rgb('+ red +',' + green +',0)' })
      if(car.id !== selectedId){
        carEntity.selectCircle.fill({ color: 'rgba(255, 255, 0, 0.03)'})
      }

      carEntity.group.move(car.position*scale, 5)
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


    // background grid
    let background = svggraph.rect(canvasWidth, canvasHeight)
    const gridSize = 25 
    var pattern = svggraph.pattern(gridSize*scale,canvasHeight, function(add) {
      add.rect(gridSize*scale,canvasHeight).stroke('#ddd').fill('none')
    }).move(0,0)
    background.fill(pattern)
  })

</script>

<style>
	.graph { width: 100%; height: 200px; }
</style>

<div class="graph" bind:this={container} use:watchResize={handleResize}/> 
