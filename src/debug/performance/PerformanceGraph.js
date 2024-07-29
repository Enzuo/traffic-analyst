/**
 *
 * @param {HTMLCanvasElement} canvas
 * @returns
 */
export function createPerformanceGraph(canvas) {
  let ctx = canvas.getContext('2d')

  let performanceObserver
  let animationFrameHandler

  let lastTimeIndex = -1
  let perfTimes = []

  // Canvas style
  ctx.font = '8px Arial'
  ctx.fillStyle = 'black'
  ctx.translate(0.5,0)

  /**
   *
   * @param {PerformanceOb} debugPerf
   */
  function setPerformanceObserver(debugPerf) {
    debugPerf.isActive = true
    performanceObserver = debugPerf
    start()
  }

  function animate() {
    animationFrameHandler = requestAnimationFrame(animate)

    if (!performanceObserver) return
    if (performanceObserver.lastTimeIndex !== lastTimeIndex){
      lastTimeIndex = performanceObserver.lastTimeIndex
      perfTimes.push(performanceObserver.lastTime)
      draw()
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillText(performanceObserver.lastTime.toFixed(2), 18, 16)

    for(var i=0; i<16 && i<perfTimes.length; i++){
      ctx.beginPath()
      ctx.moveTo(16-i, 16)
      var index = perfTimes.length -i -1
      var yValue = Math.floor(perfTimes[index]) + 1
      ctx.strokeStyle = isEven(index) ? '#F85E86' : '#D3375E'
      ctx.lineTo(16-i, 16 - yValue)
      ctx.stroke()
    }
  }

  function start() {
    animate()
  }

  function stop() {
    cancelAnimationFrame(animationFrameHandler)
  }

  return {
    start,
    stop,
    setPerformanceObserver
  }
}


function isEven(n) {
  return n % 2 == 0;
}