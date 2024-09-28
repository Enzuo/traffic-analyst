export function SimulationRunner () {
  let elapsedTime = 0
  let elapsedSimulationTime = 0

  let animateFn = []
  let simulationSpeed = 1
  let isPlaying = false
  let cancelLoopHandler


  /**
   *
   * @param {(t:number, dt:number) => void} fn
   */
  const subscribeTick = (fn) => { // TODO rename onTick , might be better visually ?
    animateFn.push(fn)
  }

  const runLoop = (t) => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)

    // 20ms, in case the simulation doesn't have smooth fps this is the longest time that can happen between ticks
    const LONGEST_TICK = 20
    let tickAmount = 1
    let dt = Math.min(t - elapsedTime, 20) * simulationSpeed
    if(dt > LONGEST_TICK){
      tickAmount = Math.ceil(dt/LONGEST_TICK)
    }
    for(var i=0; i<tickAmount; i++){
      forward(dt/tickAmount)
    }
    elapsedTime = t
  }

  const start = () => {
    if(cancelLoopHandler) return
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    isPlaying = true
  }

  const stop = () => {
    if(!isPlaying)
      return
    window.cancelAnimationFrame(cancelLoopHandler)
    cancelLoopHandler = null
    isPlaying = false
  }

  const forward = (dt) => {
    elapsedSimulationTime += dt

    for(var i=0; i<animateFn.length; i++){
      animateFn[i](elapsedSimulationTime, dt)
    }
  }

  return {
    start,
    stop,
    subscribeTick,
    get isPlaying () {
      return isPlaying
    }
  }
}