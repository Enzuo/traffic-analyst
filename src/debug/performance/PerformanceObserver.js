
/**
 * Measure performance
 * @returns DebugPerf
 */
export function createPerformanceObserver(){
  var isActive

  var startTime

  var elapsedTimes = []

  var avgTimes = []
  var measureCount = 0
  var nbMeasureAvg = 30

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
    }
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
    get lastAvgMeasure() {
      return avgTimes[avgTimes.length - 1] || 0
    }
  }
}

/**
 *
 * @param {Array} array
 * @param {number} nb
 * @returns {number} avg of last {nb} values in {array}
 */
function calculateAverageOfLastValues(array, nb) {
  // Check if the array has fewer than 30 elements
  const lastValues = array.length >= nb ? array.slice(-nb) : array;
  const sum = lastValues.reduce((acc, val) => acc + val, 0);
  const average = sum / lastValues.length;

  console.log('avg', average)

  return average;
}