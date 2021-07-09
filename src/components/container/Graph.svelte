<script lang="ts">
  import { onMount } from "svelte"
  import { SVG, PathArray } from '@svgdotjs/svg.js'

  export let getData : () => [number, number] 

  let container
  onMount(() => {

    var draw = SVG().addTo(container).size(300, 300)
    const margin = 20
    const viewX = 30 // time in seconds
    const viewY = 100 // value
    const width = 300
    const height = 300
    const precisionX = 0.2

    // scaling functions
    const scaledX = (x : number) => {
      x = x * (width-margin*2) / viewX
      return x
    }
    const scaledY = (y : number) => {
      y = y * (height-margin*2) / viewY
      return y
    }
    
    // background
    let background = draw.rect(width-margin*2, height-margin*2).attr({ fill: '#FAFAFA' }).move(margin, margin)
    let backgroundFull = draw.rect(width, height)
    console.log(scaledX(10))
    // grid
    var pattern = draw.pattern(scaledX(10), scaledY(10), function(add) {
      add.rect(scaledX(10),scaledY(10)).stroke('#ddd').fill('#FFFFFF00')
      // add.rect(10,10)
      // add.rect(10,10).move(10,10)
    }).move(margin, margin)
    backgroundFull.fill(pattern)

    let path
    let dataPts = []
    const update = () => {
      if(!getData) return
      if(path) path.remove()

      let [x, y] = getData()

      let lastPoint = dataPts[dataPts.length - 1]
      if(lastPoint && Math.abs(lastPoint.x - x) < precisionX ){
        lastPoint.y = y
      }
      else {
        dataPts.push({x, y})
      }

      let pathData = ['M', 0, margin, 'M', 0, height-margin]
      pathData = dataPts.reduce((arr, pt, i) => {
        let x = scaledX(pt.x)
        let y = height - scaledY(pt.y)
        let command = 'L'
        if(i ===0){
          command === 'M'
        }

        return arr.concat([command, x, y])
      }, pathData)
      // pathData.push('z')
      path = draw.path(pathData).attr({ fill: 'none', stroke: '#f06', 'stroke-width' : '2%' })
      path.move(width-margin-scaledX(x), 0)
    }


  
    setInterval(update, 100)
  });

</script>

<style>
	.graph { width: 100%; height: 100%; }
</style>

<div class="graph" bind:this={container} /> 