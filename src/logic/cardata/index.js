import { parseEngineSpec, convertQty } from '../lib/carlib.js'
import db from './database.js'

import * as car from './cars.js'
import * as carParts from './carParts.js'


/**
 *
 * Data Service entry points description
 *
 * Call Domain logic entities, whom themselves look for data in database
 *
 */

const api = {
  car : {
    list : car.listCars,
    get : car.getCar,
    search : (text) => car.searchCar(text)
  },

  engine : {
    get : (id) => db.engine.find((engine) => engine.id === id),
    find : (engine) => carParts.findEngine(engine),
  }
}
export default api
