/**
 *
 * @param {HTMLCanvasElement} canvas
 * @returns
 */
export function createPerformanceGraph(canvas) {
  let ctx = canvas.getContext('2d')

  let performanceObserver
  let animationFrameHandler

  /**
   *
   * @param {PerformanceObserver} debugPerf
   */
  function setPerformanceObserver(debugPerf) {
    debugPerf.isActive = true
    performanceObserver = debugPerf
    start()
  }

  function animate() {
    animationFrameHandler = requestAnimationFrame(animate)

    if (!performanceObserver) return
    draw()
  }

  function draw() {
    ctx.font = '8px Arial'
    ctx.fillStyle = 'black'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(performanceObserver.lastMeasure)
    ctx.fillText(performanceObserver.lastMeasure.toFixed(2), 0, 16)
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
