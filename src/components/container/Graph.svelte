<script lang="ts">
  import { onMount } from "svelte"
  import { SVG } from '@svgdotjs/svg.js'

  export let observeData : () => [number, number] 

  let container
  onMount(() => {

    
    const canvasWidth = container.offsetWidth || 300
    const canvasHeight = container.offsetHeight || 300
    const margin = 20
    const viewX = 10 // time in seconds
    const viewY = 100 // y value
    const gridX = 3
    const gridY = 30
    const width = canvasWidth - margin * 2
    const height = canvasHeight - margin * 2
    const precisionX = viewX / width * 2 // 2 px
    var draw = SVG().addTo(container).size(canvasWidth, canvasHeight)


    // transform functions 
    const scaledX = (x : number) => {
      // scale
      x = x * (width / viewX)
      return x
    }
    const scaledY = (y : number) => {
      y = y * (height / viewY)
      return y
    }
    
    // background
    let background = draw.rect(width, height).attr({ fill: '#FAFAFA' }).move(margin, margin)
    let backgroundFull = draw.rect(canvasWidth, canvasHeight)
    // grid
    var pattern = draw.pattern(scaledX(gridX), scaledY(gridY), function(add) {
      add.rect(scaledX(gridX),scaledY(gridY)).stroke('#ddd').fill('none')
    }).move(margin+width, margin+height)
    backgroundFull.fill(pattern)

    // legend
    draw.text("0").move(width+margin+2, height+margin).font('size', 10)
    draw.text('-'+viewX).move(margin-12, height+margin).font('size', 10)
    draw.text(''+viewY).move(width+margin+2, margin-12).font('size', 10)


    let path
    let dataPts = []
    const update = () => {
      if(!observeData) return

      let [x, y] = observeData()

      let lastPoint = dataPts[dataPts.length - 1]
      if(lastPoint && Math.abs(lastPoint.x - x) < precisionX ){
        lastPoint.y = y
        return
      }
      else {
        dataPts.push({x, y})
      }

      if(dataPts[0].x < (x - viewX)){
        dataPts.shift()
      }

      let pathData = ['M', 0, 0]
      pathData = dataPts.reduce((arr, pt, i) => {
        let x = scaledX(pt.x)
        let y = height - scaledY(pt.y)
        let command = 'L'
        if(i ===0){
          command = 'M'
        }

        return arr.concat([command, x, y])
      }, pathData)

      if(path) path.remove()
      path = draw.path(pathData).attr({ fill: 'none', stroke: '#f06', 'stroke-width' : '1%' })
      path.move(width + margin - scaledX(x), margin)
    }

  
    setInterval(update, 100)
  });

</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph" bind:this={container} /> 