import { SVG } from '@svgdotjs/svg.js'

// livegraph, realtimegraph ?
export default function realtimegraph(){
  // props
  let props

  // computed
  let width
  let height
  let precisionX

  // state
  let dataPts = []
  let svggraph = null
  let path = null
  let runHandle = null

  const setProps = (opts) => {
    // TODO find a better way here to avoid repeating, maybe use object opts
    // TODO enable 0 to be passed in
    props = {
      canvasWidth : opts.canvasWidth ?? 300,
      canvasHeight : opts.canvasHeight ?? 300,
      margin : parseInt(opts.margin) ?? 20,
      viewX : opts.viewX ?? 10,
      viewY : opts.viewY ?? 100,
      gridX : opts.gridX ?? 3,
      gridY : opts.gridY ?? 30,
      precisionPixel : opts.precisionPixel ?? 2,
    }
    
    //computed
    width = props.canvasWidth - props.margin * 2
    height = props.canvasHeight - props.margin * 2
    precisionX = props.viewX / width * 2 // 2 px

    drawScene()
  }

  const init = (container) => {
    const {canvasWidth, canvasHeight} = props

    svggraph = SVG().addTo(container).size(canvasWidth, canvasHeight)

    drawScene()
  }

  const drawScene = () => {
    const {canvasWidth, canvasHeight, margin, gridX, gridY, viewX, viewY} = props

    if(!svggraph) return
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

  // update but without "observeData"
  // const push = ({t, values} : {t:number, values:array}) => {
  const push = ({x, y} : {x:number, y:number}) => {
    const {viewX} = props

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

  const drawCurve = () => {
    const {margin} = props

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
    path.move(width + margin - scaledX(lastPointX), margin)
  }

  const run = (observableData : () => [number, number]) => {
    runHandle = setInterval(() => {
      if(!observableData) return
      let [x, y] = observableData()
      push({x, y})
    }, 100)
  }

  // transform functions 
  const scaledX = (x : number) => {
    x = x * (width / props.viewX)
    return x
  }
  const scaledY = (y : number) => {
    y = y * (height / props.viewY)
    return y
  }

  return {
    init,
    setProps,
    push,
    run,
  }
}