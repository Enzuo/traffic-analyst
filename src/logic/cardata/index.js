import * as db from './database.js'

export function listCars() {
  return db.car.list()
}

export function getCar(id) {
  let car = db.car.get(id)

  // get linked engine
  if(typeof car.engine === 'string'){
    let engineId = car.engine
    let engine = db.engine.get(engineId)
    car.engine = engine
  }

  return car
}