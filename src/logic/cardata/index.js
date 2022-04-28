import * as db from './database.js'

export function listCars() {
  return db.car.list()
}