import { parseEngineSpec, convertQty } from '../lib/carlib.js'
import { deepFreeze } from '../lib/utils.js'
import * as dataFile from './database.json'
import Fuse from 'fuse.js'

/**
 *
 * Access Raw Data
 *
 *
 */

let CAR_DATABASE = dataFile.cars
let ENGINES_DATABASE

init(dataFile.cars)

export function init(cardata){
  CAR_DATABASE = cardata
  ENGINES_DATABASE = buildEnginesDatabase(cardata).concat(dataFile.engines)
}

const db = {
  engine : ENGINES_DATABASE,
  car : CAR_DATABASE,
}

export default db;






/**
 *
 * Build CompleteEnginesDatabase from cars files
 * TODO : build it via an external script if the database ever gets too large
 *
 */

export function isEngineComplete(engine){
  if(!engine){
    return false
  }
  if(!engine.torqueX && !engine.spec){
    return false
  }
  if(!engine.name){
    return false
  }
  return true
}

function buildEnginesDatabase (cars){
  let engines = []
  for(let i=0; i<cars.length; i++){
    engines = engines.concat(findCompleteEnginesInCarFile(cars[i]))
  }

  return engines
}

function findCompleteEnginesInCarFile(car) {
  let engines = []
  let engineOrigin = {brand: car.brand, year: car.year, carId : car.id}

  engines = engines.concat(findCompleteEnginesInCar(car, engineOrigin))

  if(car.trims){
    for(var i=0; i<car.trims.length; i++){
      let trim = car.trims[i]
      engines = engines.concat(findCompleteEnginesInCar(trim, engineOrigin))
    }
  }

  return engines
}

function findCompleteEnginesInCar(car, _engineOrigin){
  const engines = []
  if(car.engine && isEngineComplete(car.engine)){
    engines.push(Object.assign({}, car.engine, {_engineOrigin}))
  }

  if(car.engines){
    for(var i=0; i<car.engines.length; i++){
      let engine = car.engines[i]
      if(isEngineComplete(engine)){
        engines.push(Object.assign({}, engine, {_engineOrigin}))
      }
    }
  }

  return engines
}