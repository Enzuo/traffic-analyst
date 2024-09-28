export const SCENARIOS = [
  {
    name : 'floor it',
    steps : [
      {t : 0, speed: 0},
      {t : 1, speed: 1000},
    ],
  },
  {
    name : 'out of roundabout acceleration',
    steps : [
      {t : 0, speed: 30, gear: 2},
      {t : 1, speed: 90},
    ],
  },
  {
    name : 'accelerating out of town',
    steps : [
      {t : 0, speed: 50, gear: 3},
      {t : 1, speed: 90},
    ],
  },
  {
    name : 'ece15',
    steps : [
      {t : 0, speed: 0},
      {t : 11, speed: 0},
      {t : 15, speed: 15},
      {t : 23, speed: 15},
      {t : 28, speed: 0},
      {t : 49, speed: 0},
      {t : 55, speed: 15},
      {t : 61, speed: 32},
      {t : 85, speed: 32},
      {t : 96, speed: 0},
      {t : 117, speed: 0},
      {t : 123, speed: 15},
      {t : 134, speed: 35},
      {t : 143, speed: 50},
      {t : 155, speed: 50},
      {t : 163, speed: 35},
      {t : 178, speed: 35},
      {t : 188, speed: 0},
      {t : 195, speed: 0},
    ],
  },
  // {
  //   name : 'eudc',
  //   steps : [
  //     {t : 0, speed: 0},
  //   ],
  // },
  // {
  //   name : 'eudc low power',
  //   steps : [
  //     {t : 0, speed: 0},
  //   ],
  // },

  // {
  //   name : 'nedc',
  //   steps : [
  //     {t : 0, speed: 50, gear: 3},
  //     {t : 1, speed: 90},
  //   ],
  // }
  // {
  //   name : 'wlpt',
  //   steps : [
  //     {t : 0, speed: 50, gear: 3},
  //     {t : 1, speed: 90},
  //   ],
  // }

]

/**
 * Get instruction for a scenario at a given time
 * @param scenario
 * @param time
 */
export function getInstruction(scenario, time) {
  var [previousStep, nextStep] = getStepsAtTime(scenario, time)
  var relativeTime = (time - previousStep.t) / (nextStep.t - previousStep.t)
  var speed = previousStep.speed + relativeTime * (nextStep.speed - previousStep.speed)

  return {speed}
}

function getStepsAtTime(scenario, time){
  let prevStep
  let nextStep
  for(let i=0; i<scenario.steps.length; i++){
    if(scenario.steps[i].t >= time){
      nextStep = scenario.steps[i]
      prevStep = scenario.steps[Math.max(0,i-1)]
      return [prevStep, nextStep]
    }
  }

  prevStep = scenario.steps[scenario.steps.length - 1]
  return [prevStep, prevStep]
}