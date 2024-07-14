import { deepFreeze } from '../lib/utils'
import * as dataFile from './database.json'
import Fuse from 'fuse.js'

let DATABASE = dataFile
let ENGINES_DATABASE


function listCars () {
  return DATABASE.cars.filter((c) => {
    return c.id !== '_default'
  })
}

const db = {
  init : (cardata) => {
    DATABASE = cardata
    ENGINES_DATABASE = buildEnginesDatabase(listCars())
  },
  car : {
    list : listCars,
    get : (id) => deepFreeze(DATABASE.cars.find((car) => car.id === id)),
    search : (text) => search(text, DATABASE)
  },

  engine : {
    get : (id) => DATABASE.engines.find((engine) => engine.id === id),
    find : (engine) => findEngine(engine),
  }
}
export default db






/**
 *
 * Build CompleteEnginesDatabase from cars files
 * TODO : build it via an external script if the database ever gets too large
 *
 */

// console.log('ENGINES_DATABASE', ENGINES_DATABASE)


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

/**
 * Find the engine best matching the given engine name
 * @param {engine|string} engine
 * @returns {engine|null}
 */
function findEngine(engine) {
  console.log('find Engine', engine)
  let engineName

  if(!engine){
    return null
  }

  if(typeof engine === 'string'){
    engineName = engine
  }

  if(typeof engine === 'object'){
    engineName = engine.name
  }

  if(!engineName){
    return null
  }


  let matchingEngines = ENGINES_DATABASE.filter(e => {
    return e.name === engineName
  })
  if(matchingEngines.length === 0 ){
    return null
  }
  if(matchingEngines.length > 1){
    // TODO pick the best match
  }

  return matchingEngines[0]
}





/**
 *
 * Fuzzy search
 *
 */


export function search(text, data) {
  let carsData = flattenCarData(data.cars)
  let fuse = new Fuse(carsData, {
    includeScore: true,
    // Search in `author` and in `tags` array
    keys: [
      'name',
      'trim',
      'brand',
      'year',
      'engine.name',
      'engine.hp',
    ]
  })

  return fuse.search(text).map(r => r.item)
}

export function flattenCarData (data) {
  // map cars to a searchable string
  let cars = data.reduce((arr, carFile) => {
    let cars = []
    cars.push(...splitCarTrimByEngine(carFile, 0))
    if(carFile.trims){
      carFile.trims.forEach((t, i) => {
        let tComplete = Object.assign({}, carFile, t)
        cars.push(...splitCarTrimByEngine(tComplete, i+1))
      })
    }

    return arr.concat(cars)
  }, [])

  return cars
}


function splitCarTrimByEngine(car, trimId){
  let cars = []
  let engineId = 0
  if(car.engine){
    cars.push(Object.assign({}, car, {engineId, trimId}))
    engineId++
  }
  if(car.engines){
    cars.push(...car.engines.map((e) => {
      let c = Object.assign({}, car, {...e, engineId, trimId})
      engineId++
      return c
    }))
  }
  return cars
}