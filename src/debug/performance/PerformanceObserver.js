import * as logger from '../logger/Logger'

/**
 * Measure performance
 * @param {string} name
 * @returns DebugPerf
 */
export function createPerformanceObserver(name=''){
  var isActive

  var startTime

  var elapsedTimes = []

  var avgTimes = []
  var measureCount = 0
  var nbMeasureAvg = 30 // 0.5seconds

  function measureStart() {
    if(!isActive) return
    startTime = performance.now()
  }

  function measureEnd() {
    if(!isActive) return
    var endTime = performance.now()
    var elapsedTime = endTime - startTime
    elapsedTimes.push(elapsedTime)
    measureCount++
    if(measureCount > nbMeasureAvg){
      measureCount = 0
      var average = calculateAverageOfLastValues(elapsedTimes, nbMeasureAvg)
      avgTimes.push(average)
      // TODO might need to clean array at some point to avoid memory hog

      // log after 30seconds
      if(avgTimes.length === 60){
        logPerfStats()
      }
    }
  }

  function logPerfStats(){
    var average = calculateAverageOfLastValues(avgTimes)
    var max = Math.max(...avgTimes)
    var min = Math.min(...avgTimes)
    logger.addPerfLog(name, average, max, min)
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
    get lastTime() {
      return avgTimes[avgTimes.length - 1] || 0
    },
    get lastTimeIndex() {
      return avgTimes.length - 1
    },
  }
}

/**
 *
 * @param {Array} array
 * @param {number=} nb
 * @returns {number} avg of last {nb} values in {array}
 */
function calculateAverageOfLastValues(array, nb) {
  // Check if the array has fewer than 30 elements
  const lastValues = nb && array.length >= nb ? array.slice(-nb) : array;
  const sum = lastValues.reduce((acc, val) => acc + val, 0);
  const average = sum / lastValues.length;

  return average;
}