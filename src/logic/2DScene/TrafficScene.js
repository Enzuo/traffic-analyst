import { createPerformanceObserver } from "@/debug/performance/PerformanceObserver"

const ASSETS_PATH = '2dassets/'

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {TrafficSimulation} simulation
 * @return TrafficScene
 */
export function createTrafficScene(canvas, simulation) {
  let ctx = canvas.getContext('2d')

  let _animatables = []

  let debugPerf = createPerformanceObserver('TrafficScenePixelArt')

  //ctx.scale(2, 2);  // Scale drawing operations by 2 in both x and y directions


  const middleGround = createNode2D(0, 30)
  middleGround.addChild(createRoad(ctx))
  middleGround.addChild(createImage(ctx,'',100,-18))
  _animatables.push(middleGround)

  simulation.cars.forEach(c => {
    _animatables.push(createCar(ctx, c))
  })





  start()

  // link events
  simulation.on('car_created', handleSimulationCarCreated)

  function handleSimulationCarCreated(car){
    console.log('simulation has a new car', car)

    _animatables.push(createCar(ctx, car))
  }


  function animate(dt) {
    debugPerf.measureStart()
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    middleGround.move(-0.3, 0)

    _animatables.forEach(a => {
      a.animate(dt)
    })

    animationHandler = requestAnimationFrame(animate);
    debugPerf.measureEnd()
  }


  var animationHandler
  function start() {
    if(!animationHandler){
      animationHandler = requestAnimationFrame(animate);
    }
  }
  function stop() {
    cancelAnimationFrame(animationHandler)
  }

  return {
    start,
    stop,
    debug : {
      perf : debugPerf
    }
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function createRoad(ctx) {
  var startPoint = { x: 0, y: 30 }
  var length = 960
  var lanes = 3
  var lanesHeight = 12

  var dottedLineLength = 6
  var dottedLineSpace = 12
  var dottedLineColor = '#FFF42D'
  var lineColor = '#FFF42D'
  var tarmacColor = '#302E37'

  function draw(posx, posy) {
    var x = Math.floor(posx)
    var y = Math.floor(posy)
    // remove lines antialiasing
    ctx.translate(0, 0.5)

    // create tarmac
    ctx.fillStyle = tarmacColor
    var tarmacHeight = lanes * lanesHeight + (lanes + 1)
    ctx.fillRect(0, y, length, tarmacHeight)

    // paint lines
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(length, y)
    ctx.stroke()

    ctx.beginPath()
    for (var i = 1; i < lanes; i++) {
      ctx.setLineDash([dottedLineLength, dottedLineSpace])
      var offsetY = i * (lanesHeight + 1)
      ctx.moveTo(x, y + offsetY)
      ctx.lineTo(length, y + offsetY)
    }
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.moveTo(x, y + tarmacHeight)
    ctx.lineTo(length, y + tarmacHeight)
    ctx.stroke()

    ctx.translate(0, -0.5)
  }

  function animate(dt) {
    draw()
  }

  return {
    animate,
    draw,
  }

}

/**
 *
 * @param {*} ctx
 * @param {CarEntity} car
 * @returns
 */
function createCar(ctx, car) {
  // Create a new image object
  var img = new Image()

  // Set the source of the image
  img.src = ASSETS_PATH + 'landroverDefender.png'

  // Draw the image on the canvas once it's loaded
  img.onload = function () {
    // Draw the image at coordinates (0, 0)
      // remove antialiasing
    // ctx.translate(0, -0.5)
    // ctx.drawImage(img, 0, 0)
  }


  var position = {x: 0, y:0}

  //ctx.translate(0, -0.5)

  function animate(dt){
    //ctx.translate(0, -0.5)
    position.x = car.state.position*10
    ctx.drawImage(img, Math.floor(position.x), position.y+45-img.height)
  }

  return {
    animate
  }
}


/**
 * Can serve to group node together and show them at a special position
 * @param {*} x
 * @param {*} y
 * @returns
 */
function createNode2D(x, y) {
  var childrens = []
  function animate(){
    childrens.forEach(c => c.draw(x, y))
  }

  function addChild(child){
    childrens.push(child)
  }

  function move(mx, my){
    x += mx
    y += my
  }

  function draw(posx, posy){
    childrens.forEach(c => c.draw(posx+x, posy+y))
  }

  return {
    animate,
    draw,
    addChild,
    move,
  }
}

function createImage(ctx, src, x, y) {
  // Create a new image object
  var img = new Image()

  // Set the source of the image
  img.src = ASSETS_PATH + 'background/road_border.png'

  // Draw the image on the canvas once it's loaded
  img.onload = function () {
    // Draw the image at coordinates (0, 0)
      // remove antialiasing
    // ctx.translate(0, -0.5)
    // ctx.drawImage(img, 0, 0)
  }



  function draw(posx, posy){
    //ctx.translate(0, -0.5)
    ctx.drawImage(img, posx + x, posy + y)
  }

  return {
    draw
  }
}