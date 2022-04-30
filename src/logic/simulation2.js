export function Simulation () {
  let elapsedTime = 0
  let elapsedSimulationTime = 0

  let animateFn = []
  let isPlaying = false
  let cancelLoopHandler


  /**
   * 
   * @param {(t:number, dt:number) => {}} fn 
   */
  const addAnimate = (fn) => {
    animateFn.push(fn)
  }

  const runLoop = (t) => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    forward(t)
  }

  const start = () => {
    cancelLoopHandler = window.requestAnimationFrame(runLoop)
    isPlaying = true
  }

  const stop = () => {
    window.cancelAnimationFrame(cancelLoopHandler)
    cancelLoopHandler = null
    isPlaying = false
  }

  const forward = (t) => {
    // 20ms, in case the simulation doesn't have smooth fps this is the longest time that can happen between ticks
    const LONGEST_TICK = 20 

    let dt = Math.min(t - elapsedTime, LONGEST_TICK)
    elapsedTime = t
    elapsedSimulationTime += dt

    for(var i=0; i<animateFn.length; i++){
      animateFn[i](t, dt)
    }
  }
  
  return {
    start,
    stop,
    addAnimate
  }    
}