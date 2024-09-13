import { deepFreeze } from "../lib/utils"
import db from "./database"
import data from './index'
import * as carParts from './carParts'
import Fuse from "fuse.js"

export function listCars () {
  return db.car.filter((c) => {
    return c.id !== '_default'
  })
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
  let car = deepFreeze(db.car.find((car) => car.id === carId))
  if (!car) throw Error('car not found')

  const availableGearboxes = carParts.extractGearboxesFrom(car)


  // concat default trim with additionals trims & filter null
  const trimsOptions = [].concat({trim: car.trim || 'default'}, car.trims ? car.trims.filter(t => t.trim) : [])
  // apply selected trim
  // if(typeof trimId === 'string') trimId = trimsOptions.findIndex(t => t.trim === trimId)
  car = Object.assign({}, car, trimsOptions[trimId])


  // apply selected conf
  let availableConfigs = generateConfigs(car)
  availableConfigs = availableConfigs.map((conf) => {
    let config = Object.assign({}, conf)
    let engine = config.engine
    if(!carParts.isEngineDetailed(engine)){ // TODO just check if string
      let detailedEngine = data.engine.find(engine)
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
    if(!carParts.isEngineDetailed(engine)){
      let detailedEngine = data.engine.find(engine)
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
  // car = completeEngineData(car)

  // return car with its available trims and configs
  return Object.assign(Object.create(defaultCar), car, {trims : trimsOptions, configs : availableConfigs}, {trimId, configId})
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