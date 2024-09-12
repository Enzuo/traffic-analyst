import { parseEngineSpec, convertQty } from '../carLogic/carlib.js'
import { deepFreeze } from '../lib/utils'
import * as dataFile from './database.json'
import Fuse from 'fuse.js'

let CAR_DATABASE = dataFile.cars
let ENGINES_DATABASE

// function listCars () {
//   return cars.filter((c) => {
//     return c.id !== '_default'
//   })
// }

init(dataFile.cars)

// const db = {
//   init : (cardata) => {
//     DATABASE = cardata
//     ENGINES_DATABASE = buildEnginesDatabase(listCars())
//   },
//   car : {
//     list : listCars,
//     get : (id) => deepFreeze(cars.find((car) => car.id === id)),
//     search : (text) => searchCar(text, DATABASE)
//   },

//   engine : {
//     get : (id) => DATABASE.engines.find((engine) => engine.id === id),
//     find : (engine) => findEngine(engine),
//   }
// }

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

// ENGINES_DATABASE = buildEnginesDatabase(listCars())

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
 * @param {*} engine engine to check
 * @returns {boolean}
 */
function isEngineDetailed(engine){
  if(!engine){
    return false
  }
  if(engine.spec){
    return true
  }
  if(engine.torqueX){
    return true
  }
  return false
}


function completeEngineData(car) {
  // compute engine torqueCurve
  var engine = Object.assign({}, car.engine)
  if(!engine.torqueCurve){
    if(engine.torqueX){
      let curve = []
      for(let i=0; i < engine.torqueX.length; i++){
        let xMultiplier = engine.torqueXMultiplier ? engine.torqueXMultiplier : 1
        curve.push([engine.torqueX[i] * xMultiplier, engine.torqueY[i]])
      }
      engine.torqueCurve = curve
    }
    else if(engine.spec){
      engine.torqueCurve = parseEngineSpec(engine.spec)
    }
  }

  engine.power = convertQty(engine.power).value


  car.engine = engine
  return car
}





/**
 *
 * Fuzzy search
 *
 */


export function searchCar(text, data) {
  const carsData = flattenCarData(data.cars)
  const fuse = new Fuse(carsData, {
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

/**
 * Extract trims & config contained inside a CarData in several CarData
 * @param {CarDataRaw[]} data
 * @returns {CarDataRaw[]}
 */
export function flattenCarData (data) {
  return data.reduce((arr, carData) => {
    const cars = []

    // default trim
    cars.push(...splitCarTrimByConfig(carData, 0))

    // additional trims
    if(carData.trims){
      carData.trims.forEach((t, i) => {
        const trimComplete = Object.assign({}, carData, t)
        cars.push(...splitCarTrimByConfig(trimComplete, i+1))
      })
    }

    return arr.concat(cars)
  }, [])
}

/**
 * Split a car trim into several for each available configs for that trim
 * @param {CarDataRaw} car carTrim
 * @param {number} trimId
 * @returns
 */
function splitCarTrimByConfig(car, trimId){
  let cars = []
  let configId = 0

  let configs = generateConfigs(car)

  if(configs){
    cars.push(...configs.map((conf) => {
      let c = Object.assign({}, car, conf, {configId, trimId})
      configId++
      return c
    }))
  }
  return cars
}


/**
 * Compute all available configs for a car
 * based on engines and gearboxes or configs object if defined
 * + default engine/gearbox couple
 *
 * @param {CarDataRaw} car
 * @returns {CarConfig[]}
 */
function generateConfigs(car){
  var configs = []
  var availableEngines = [].concat(car.engine, ...car.engines || []).filter(Boolean)
  var availableGearboxes = [].concat(car.gearbox, ...car.gearboxes || []).filter(Boolean)

  if(car.configs){
    // add default config with default engine/default gearbox to the availables configs
    if(car.engine){
      configs.push({engine: car.engine, gearbox: availableGearboxes[0]})
    }
    return configs.concat(car.configs)
  }

  for(var i=0; i < availableEngines.length; i++) {
    if(availableGearboxes.length === 0){
      configs.push({engine: availableEngines[i]})
    }
    for(var j=0; j < availableGearboxes.length; j++) {
      configs.push({engine: availableEngines[i], gearbox : availableGearboxes[j]})
    }
  }
  return configs
}


/**
 * Complete a car raw data if there is eventually missing data (engine, gearbox)
 * @param {CarDataRaw} car
 * @return {Car}
 */
function completeCar(car){

}


/**
 *
 * @param {string} carId
 * @param {number=} trimId
 * @param {number=} configId
 * @param {number=} engineId override engine
 * @param {number=} gearboxId override gearbox
 * @returns {Car}
 */
export function getCar(carId, trimId=0, configId=0, engineId, gearboxId) {
  console.log('getting car', carId, trimId, configId, engineId, gearboxId)
  let car = db.car.get(carId)
  if (!car) throw Error('car not found')

  const availableGearboxes = extractGearboxesFrom(car)


  // regroup base trim with additionals trims
  const trimsOptions = [].concat({trim: car.trim || 'default'}, car.trims ? car.trims.filter(t => t.trim) : [])
  // apply selected trim
  // if(typeof trimId === 'string') trimId = trimsOptions.findIndex(t => t.trim === trimId)
  car = Object.assign({}, car, trimsOptions[trimId])


  // apply selected conf
  let availableConfigs = generateConfigs(car)
  availableConfigs = availableConfigs.map((conf) => {
    let config = Object.assign({}, conf)
    let engine = config.engine
    if(!isEngineDetailed(engine)){
      let detailedEngine = db.engine.find(engine)
      config.engine = detailedEngine
    }
    return config
  })
  var config = availableConfigs[configId]
  car = Object.assign({}, car, config)

  // regroup engines options with default engine & engines
  const enginesOptions = [].concat(
    {engine: car.engine},
    car.engines ? car.engines.reduce((a, e) => e.engine && e.engine.name ? a.concat(e) : a, [])  : [])
  enginesOptions.forEach((eOpts) => {
    let engine = eOpts.engine
    if(!isEngineDetailed(engine)){
      let detailedEngine = db.engine.find(engine)
      eOpts.engine = detailedEngine
    }
  })

  // apply selected engine
  if(engineId >= enginesOptions.length){
    engineId = 0
  }
  car = Object.assign({}, car, enginesOptions[engineId])

  // complete gearbox
  if(typeof car.gearbox === 'string'){
    let gb = availableGearboxes.find(g => g.name === car.gearbox)
    car.gearbox = gb ? gb : defaultCar.gearbox
  }

  // TODO move to complete engine database
  car = completeEngineData(car)

  // return car with its available trims and configs
  return Object.assign(Object.create(defaultCar), car, {trims : trimsOptions, configs : availableConfigs}, {trimId, configId})
}



/**
 *
 * Gearbox
 *
 */

/**
 * Find all defined gearboxes in cardata which could be reused someswhere else
 * @param {*} cardata
 * @returns {gearbox[]}
 */
function extractGearboxesFrom(cardata) {
  let gearboxes = []

  if(cardata.gearbox && isGearBox(cardata.gearbox)){
    gearboxes.push(cardata.gearbox)
  }

  if(cardata.gearboxes){
    cardata.gearboxes.forEach(gb => {
      if(isGearBox(gb)){
        gearboxes.push(gb)
      }
    })
  }

  if(cardata.configs){
    cardata.configs.forEach(config => {
      let gbs = extractGearboxesFrom(config)
      gearboxes.push(...gbs)
    })
  }

  if(cardata.trims && cardata.trims.length > 0){
    for(var i=0; i<cardata.trims.length; i++){
      let gbs = extractGearboxesFrom(cardata.trims[i])
      gearboxes.push(...gbs)
    }
  }

  return gearboxes
}
/**
 * Is data a complete gearbox definition
 */
function isGearBox(data){
  if(typeof data != 'object'){
    return false
  }
  if(!data.name){
    return false
  }


  return true
}


const defaultCar = {
  weight : 1000,
  height:1600,
  width:1600,
  length:4000,
  wheelDiameter:63,
  dragCoef: 0.3,
  dragArea: 2,
  brakePadsForce: 12000,
  gearbox: {
    gearRatio : [4,2,1],
    driveRatio : 4,
  }
}