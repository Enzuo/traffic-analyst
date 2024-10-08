import db from '@/logic/cardata/database'
import { getCar } from '@/logic/cardata'
import { describe, it, expect, test, beforeAll, assert } from 'vitest'

/** @type {CarDataRaw[]} */
export const TEST_CARDATA = [{
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
    { name : 'engine 2', spec : '70hp@4000'},
  ],
  trims : [{
    trim : 'car trim 1',
    configs : [{ engine : 'engine 1', weight : 1250}]
  }],
}, {
  id : 'car auto',
  weight : 1000,
  engines : [
    { name : 'engine 1', spec : '65hp@6000'},
    { name : 'engine 2', spec : '70hp@4000'},
  ],
  trims : [{
    trim : 'car trim 1',
  }],
}, {
  id : 'car multi gb',
  weight : 1000,
  engines : [
    { name : 'engine 1', spec : '65hp@6000'},
    { name : 'engine 2', spec : '70hp@4000'},
  ],
  gearboxes : [
    { name : 'gb 1', gearRatio : [4,2,1]},
    { name : 'gb 2', gearRatio : [5,3,1]},
  ],
  trims : [{
    trim : 'car trim 1',
  }],
}, {
  id : 'car default eng',
  weight : 1000,
  engine : {
    name : 'engine 0', spec : '50hp@5500'
  },
  engines : [
    { name : 'engine 1', spec : '65hp@6000'},
    { name : 'engine 2', spec : '70hp@4000'},
  ],
  gearboxes : [
    { name : 'gb 1', gearRatio : [4,2,1]},
    { name : 'gb 2', gearRatio : [5,3,1]},
  ],
  trims : [{
    trim : 'car trim 1',
  }],
}, {
  id : 'car default eng conf',
  weight : 1000,
  engine : {
    name : 'engine 0', spec : '50hp@5500'
  },
  engines : [
    { name : 'engine 1', spec : '65hp@6000'},
  ],
  gearboxes : [
    { name : 'gb 1', gearRatio : [4,2,1]},
  ],
  configs : [
    { engine : 'engine 1', gearbox : 'gb 1', weight:1250}
  ],
  trims : [{
    trim : 'car trim 1',
  }],
}]

const TEST_ENGINEDATA = [{

}]

describe.only('car data transformation', () => {
  beforeAll(() => {
    console.log('init done')
    db.init({cars : TEST_CARDATA, engines : TEST_ENGINEDATA})
  })

  test('get car (no trims, no configs)', () => {
    var car = getCar('barebone car')
    console.log(car)
    assert.equal(car.engine.name, 'barebone engine')
    assert.equal(car.engine.spec, '80hp@6500')
    assert.equal(car.configs.length, 1)
  })

  test('get car default trim default config', () => {
    var car = getCar('car base')
    console.log(car)
  })

  test('get car default trim first config', () => {
    var car = getCar('car base', 0, 0)
    console.log(car)
    assert.equal(car.engine.name, 'engine 1')
    assert.equal(car.engine.spec, '65hp@6000')
    assert.equal(car.configs.length, 2)

  })

  test('get car default trim second config', () => {
    var car = getCar('car base', 0, 1)
    console.log(car)
    assert.equal(car.engine.name, 'engine 2')
    assert.equal(car.engine.spec, '70hp@4000')
    assert.equal(car.configs.length, 2)
  })

  test('get car trim first config', () => {
    var car = getCar('car base', 1, 0)
    console.log(car)
    assert.equal(car.engine.name, 'engine 1')
    assert.equal(car.engine.spec, '65hp@6000')
    assert.equal(car.weight, 1250)
    assert.equal(car.configs.length, 1)
  })

  test('auto generate configs from engines', () => {
    var car = getCar('car auto', 0, 0)
    console.log(car)
    assert.equal(car.engine.name, 'engine 1')
    assert.equal(car.engine.spec, '65hp@6000')
    assert.equal(car.configs.length, 2)
  })

  test('car has no default, no configs -> auto generate configs from engines & gearboxes', () => {
    var car = getCar('car multi gb', 0, 0)
    console.log(car)
    assert.equal(car.engine.name, 'engine 1')
    assert.equal(car.engine.spec, '65hp@6000')
    assert.equal(car.gearbox.name, 'gb 1')
    assert.deepEqual(car.gearbox.gearRatio, [4,2,1])
    assert.equal(car.configs.length, 4)
  })

  test('car has default engine', () => {
    var car = getCar('car default eng', 0, 0)
    console.log(car)
    assert.equal(car.engine.name, 'engine 0')
    assert.equal(car.engine.spec, '50hp@5500')
    assert.equal(car.gearbox.name, 'gb 1')
    assert.deepEqual(car.gearbox.gearRatio, [4,2,1])
    assert.equal(car.configs.length, 6)
  })

  test('car has default engine and configs', () => {
    var car = getCar('car default eng conf', 0, 1)
    console.log(car)
    assert.equal(car.engine.name, 'engine 1')
    assert.equal(car.engine.spec, '65hp@6000')
    assert.equal(car.gearbox.name, 'gb 1')
    assert.deepEqual(car.gearbox.gearRatio, [4,2,1])
    assert.equal(car.configs.length, 2)
  })
})

