import { test, assert, describe } from 'vitest'
import { SCENARIOS, getInstruction } from './SimulationScenario'

describe('get instruction from scenario', () => {
  let scenario = SCENARIOS.find(s => s.name === 'ece15')

  const testCases = [
    [12, 3.75],
    [15, 15],
    [25, 9],
  ]
  test.each(testCases)('should correctly parse "%s" to "%s"', (input, expected) => {
    let {speed} = getInstruction(scenario, input)
    assert.equal(speed, expected)
  })

  test('time after scenario last step', () => {
    let {speed} = getInstruction(scenario, 200)
    assert.equal(speed, 0)
  })

  test('time at scenario first step', () => {
    let {speed} = getInstruction(scenario, 0)
    assert.equal(speed, 0)
  })
})