
/**
 * Measure performance
 * @returns DebugPerf
 */
export function createPerformanceObserver(){
  var isActive

  var startTime

  var elapsedTimes = []

  function measureStart() {
    if(!isActive) return
    startTime = performance.now()
  }

  function measureEnd() {
    if(!isActive) return
    var endTime = performance.now()
    var elapsedTime = endTime - startTime
    elapsedTimes.push(elapsedTime)
  }

  return {
    measureStart,
    measureEnd,
    set isActive(value) {
      isActive = value
    },
    get lastMeasure() {
      return elapsedTimes[elapsedTimes.length - 1]
    },
  }
}