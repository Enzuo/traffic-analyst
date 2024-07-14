import db from '@/logic/cardata/database'
import { getCar } from '@/logic/cardata'
import { describe, it, expect, test, beforeAll } from 'vitest'

const test_data_cars = [{
  id : 'barebone car',
  engine : {
    name : 'barebone engine',
    spec : '80hp@6500',
  },
}, {
  id : 'car base',
  weight : 1000,
  configs : [{ engine : 'engine 1'}, { engine : 'engine 2', weight : 1500}],
  engines : [
    { name : 'engine 1', spec : '65hp@6000'},
    { name : 'engine 2', spec : '70hp@4000'}
  ],
  trims : [{
    trim : 'car trim 1',
    configs : [{ engine : 'engine 1', weight : 1250}]
  }],
}]

const test_data_engines = [{

}]

describe.only('car data transformation', () => {
  beforeAll(() => {
    console.log('init done')
    db.init({cars : test_data_cars, engines : test_data_engines})
  })

  test('get car (no trims, no configs)', () => {
    var car = getCar('barebone car')
    console.log(car)
  })

  test('get car default trim default config', () => {
    var car = getCar('car base')
    console.log(car)
  })

  test('get car default trim first config', () => {
    var car = getCar('car base', 0, 0)
    console.log(car)
  })

  test('get car default trim second config', () => {
    var car = getCar('car base', 0, 1)
    console.log(car)
  })
})

