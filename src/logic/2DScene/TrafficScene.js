const ASSETS_PATH = '2dassets/'

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {any[]} cars
 * @return {any} TrafficScene
 */
export function createTrafficScene(canvas, cars) {
  let ctx = canvas.getContext('2d')

  let _animatables = []

  //ctx.scale(2, 2);  // Scale drawing operations by 2 in both x and y directions

  _animatables.push(createRoad(ctx))

  _animatables.push(createCar(ctx))

  ctx.beginPath()
  ctx.moveTo(0, canvas.height / 2) // Start at the left side of the canvas, vertically centered
  ctx.lineTo(50, 50)

  ctx.strokeStyle = '#000000' // Set the line color to black
  ctx.lineWidth = 1 // Set the line width to 2 pixels

  // Draw the line
  ctx.stroke()

  start()


  function animate(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    _animatables.forEach(a => {
      a.animate(dt)
    })

    requestAnimationFrame(animate);
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
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function createRoad(ctx) {
  var startPoint = { x: 0, y: 30 }
  var length = 256
  var lanes = 3
  var lanesHeight = 12

  var dottedLineLength = 6
  var dottedLineSpace = 12
  var dottedLineColor = '#FFF42D'
  var lineColor = '#FFF42D'
  var tarmacColor = '#302E37'

  function draw() {
    // remove lines antialiasing
    ctx.translate(0, 0.5)

    // create tarmac
    ctx.fillStyle = tarmacColor
    var tarmacHeight = lanes * lanesHeight + (lanes + 1)
    ctx.fillRect(startPoint.x, startPoint.y, length, tarmacHeight)

    // paint lines
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(length, startPoint.y)
    ctx.stroke()

    ctx.beginPath()
    for (var i = 1; i < lanes; i++) {
      ctx.setLineDash([dottedLineLength, dottedLineSpace])
      var offsetY = i * (lanesHeight + 1)
      ctx.moveTo(startPoint.x, startPoint.y + offsetY)
      ctx.lineTo(length, startPoint.y + offsetY)
    }
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.moveTo(startPoint.x, startPoint.y + tarmacHeight)
    ctx.lineTo(length, startPoint.y + tarmacHeight)
    ctx.stroke()

    ctx.translate(0, -0.5)
  }

  function animate(dt) {
    draw()
  }

  return {
    animate
  }

}

function createCar(ctx) {
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
    position.x += 1
    ctx.drawImage(img, position.x, position.y+45-img.height)
  }

  return {
    animate
  }
}
