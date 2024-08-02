import { assert, test } from 'vitest'
import { parseLog } from './Logger'

const logData = `
TrafficScenePixelArt avg_frame_time= 0.10ms, min_frame_time= 0.07ms, max_frame_time= 0.20ms
TrafficSimulation    avg_frame_time= 0.05ms, min_frame_time= 0.03ms, max_frame_time=10.11ms
`

test.only('parse log', () => {
  var parsedLog = parseLog(logData)
  assert.deepEqual(parsedLog, [
    {
      identifier: 'TrafficScenePixelArt',
      avg_frame_time: '0.10ms',
      min_frame_time: '0.07ms',
      max_frame_time: '0.20ms'
    },
    {
      identifier: 'TrafficSimulation',
      avg_frame_time: '0.05ms',
      min_frame_time: '0.03ms',
      max_frame_time: '0.11ms'
    }
  ])
})
