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

  const background = createNode2D(0, 0)
  background.addChild(createTiledBackground(0,-8, 'background/background_city.png'))
  _animatables.push(background)


  const middleGround = createNode2D(0, 30)
  middleGround.addChild(createRoad())
  middleGround.addChild(createTiledBackground(0,-18, 'background/road_border.png'))
  _animatables.push(middleGround)

  simulation.cars.forEach(c => {
    middleGround.addChild(createCar(c))
  })





  start()

  // link events
  simulation.on('car_created', handleSimulationCarCreated)

  function handleSimulationCarCreated(car){
    console.log('simulation has a new car', car)

    middleGround.addChild(createCar(car))
  }


  function animate(dt) {
    debugPerf.measureStart()
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    background.move(-0.1, 0)
    middleGround.move(-0.3, 0)

    _animatables.forEach(a => {
      a.animate(dt)
    })

    _animatables.forEach(a => {
      a.draw(ctx)
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
 */
function createRoad() {
  var startPoint = { x: 0, y: 30 }
  var length = 960
  var lanes = 3
  var lanesHeight = 12

  var dottedLineLength = 15
  var dottedLineSpace = 30
  var dottedLineColor = '#FFF42D'
  var lineColor = '#FFF42D'
  var tarmacColor = '#302E37'

  function draw(ctx, posx, posy) {
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
  }

  return {
    animate,
    draw,
  }

}

/**
 *
 * @param {CarEntity} car
 * @returns
 */
function createCar(car) {
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

  function animate(dt){

  }

  function draw(ctx, posx, posy){
    position.x = car.state.position*10
    ctx.drawImage(img, Math.floor(position.x) + posx, position.y+45-img.height)
  }

  return {
    animate,
    draw,
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
  function animate(dt){
    childrens.forEach(c => c.animate(dt))
  }

  function addChild(child){
    childrens.push(child)
  }

  function move(mx, my){
    x += mx
    y += my
  }

  function draw(ctx, posx=0, posy=0){
    childrens.forEach(c => c.draw(ctx, posx+x, posy+y))
  }

  return {
    animate,
    draw,
    addChild,
    move,
  }
}

function createImage(src, x, y) {
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



  function draw(ctx, posx, posy){
    //ctx.translate(0, -0.5)
    ctx.drawImage(img, posx + x, posy + y)
  }

  return {
    draw
  }
}

function createTiledBackground(x, y, src) {

  var img = new Image()
  // Set the source of the image
  img.src = ASSETS_PATH + src

  var length = 960

  function draw(ctx, posx, posy){

    var atx = x + posx
    var aty = y + posy
    while(atx < length){
      ctx.drawImage(img, atx, aty)
      atx += 100
    }
  }

  function animate(){

  }

  return {
    draw,
    animate,
  }
}