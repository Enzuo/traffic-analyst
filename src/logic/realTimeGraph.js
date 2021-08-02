import { SVG } from '@svgdotjs/svg.js'

// livegraph, realtimegraph ?
export default function realtimegraph(opts){
  // props
  let canvasWidth = 300
  let canvasHeight = 300
  let margin = 20
  let viewX = 10 
  let viewY = 100
  let gridX = 3
  let gridY = 30
  let precisionPixel = 2

  // computed
  let width = canvasWidth - margin * 2
  let height = canvasHeight - margin * 2
  let precisionX = viewX / width * 2

  // state
  let dataPts = []
  let svggraph = null
  let path = null
  let pathValue = null
  let runHandle = null

  setOptions(opts || {})
  function setOptions (opts) {
    // TODO find a better way here to avoid repeating, maybe use object opts
    // TODO enable 0 to be passed in
    canvasWidth = parseInt(opts.width) || canvasWidth
    canvasHeight = parseInt(opts.height) || canvasHeight
    margin = Math.min(parseInt(opts.margin), Math.min(canvasWidth/2,canvasHeight/2)) || margin
    viewX = opts.viewX || viewX
    viewY = opts.viewY || viewY
    gridX = opts.gridX || (viewX / 6)
    gridY = opts.gridY || (viewY / 6)
    precisionPixel = opts.precisionPixel || precisionPixel
    
    //computed
    width = canvasWidth - margin * 2
    height = canvasHeight - margin * 2
    precisionX = viewX / width * 2

    if(svggraph) svggraph.size(canvasWidth, canvasHeight)

    drawScene()
    drawCurve()
  }

  function init (container) {
    svggraph = SVG().addTo(container).size(canvasWidth, canvasHeight)

    drawScene()
  }

  function drawScene () {
    if(!svggraph) return

    // redraw svg
    svggraph.clear()

    // background
    svggraph.rect(width, height).attr({ fill: '#FAFAFA' }).move(margin, margin)
    let backgroundFull = svggraph.rect(canvasWidth, canvasHeight)
    // grid
    var pattern = svggraph.pattern(scaledX(gridX), scaledY(gridY), function(add) {
      add.rect(scaledX(gridX),scaledY(gridY)).stroke('#ddd').fill('none')
    }).move(margin+width, margin+height)
    backgroundFull.fill(pattern)

    // legend
    svggraph.text("0").move(width+margin+2, height+margin).font('size', 10)
    svggraph.text('-'+viewX).move(margin-12, height+margin).font('size', 10)
    svggraph.text(''+viewY).move(width+margin+2, margin-12).font('size', 10)
  }

  /**
   * 
   * @param {{x:number, y:number}} param0 
   * @returns 
   */
  function push ({x, y}) {
    let lastPoint = dataPts[dataPts.length - 1]
    if(lastPoint && Math.abs(lastPoint.x - x) < precisionX ){
      lastPoint.y = y
      return
    }
    else {
      dataPts.push({x, y})
    }

    while(dataPts[0].x < (x - viewX)){
      dataPts.shift()
    }

    drawCurve()
  }

  function drawCurve () {
    if(!dataPts.length) return 

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
    path = svggraph.path(pathData).attr({ fill: 'none', stroke: '#f06', 'stroke-width' : '1%' })

    let lastPointX = dataPts[dataPts.length - 1].x
    let lastPointY = dataPts[dataPts.length - 1].y
    path.move(width + margin - scaledX(lastPointX), margin)

    if(pathValue) pathValue.remove()
    pathValue = svggraph.text(lastPointY).move(width+margin-10, Math.max(margin-20, margin-20+height-scaledY(lastPointY))).font('size', 10)
  }

  /**
   * 
   * @param {() => [number, number]} observableData 
   */
  function run (observableData) {
    runHandle = setInterval(() => {
      if(!observableData) return
      let [x, y] = observableData()
      push({x, y})
    }, 100)
  }

  // transform functions 
  const scaledX = (x) => {
    x = x * (width / viewX)
    return x
  }
  const scaledY = (y) => {
    y = y * (height / viewY)
    return y
  }

  return {
    init,
    setOptions,
    push,
    run,
  }
}