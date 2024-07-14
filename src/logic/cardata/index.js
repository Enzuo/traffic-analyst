import { parseEngineSpec } from '../carLogic/carlib.js'
import db from './database.js'

/**
 *
 * @returns {Array<Car>}
 */
export function listCars() {
  return db.car.list()
}

/**
 * @typedef {object} Car
 * @property {string} trim
 */


/**
 *
 * @param {string} carId
 * @returns {Car}
 */
export function getCar(carId, trimId=0, configId=0, engineId, gearboxId) {
  console.log('getting car', carId, trimId, configId, engineId, gearboxId)
  let car = db.car.get(carId)
  if (!car) throw Error('car not found')

  // regroup base trim with additionals trims
  const trimsOptions = [].concat({trim: car.trim || 'default'}, car.trims || [])
  // apply selected trim
  // if(typeof trimId === 'string') trimId = trimsOptions.findIndex(t => t.trim === trimId)
  car = Object.assign({}, car, trimsOptions[trimId])

  // apply selected conf
  let availableConfigs = [].concat(car.configs ? car.configs : generateConfigs(car))
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

  // TODO move to complete engine database
  car = completeEngineData(car)


  // return car with its available trims and configs
  return Object.assign(Object.create(defaultCar), car, {trims : trimsOptions, configs : availableConfigs}, {trimId, configId})
}


/**
 * Generate all possible configs for a car
 * based on engines and gearboxes directly defined in the data
 * @param {CarData} car
 * @returns {CarConfig[]}
 */
function generateConfigs(car){
  var configs = []
  var availableEngines = [].concat(car.engine, ...car.engines || [])
  var availableGearboxes = [].concat(car.gearbox, ...car.gearboxes || [])
  for(var i=0; i < availableEngines.length; i++) {
    for(var j=0; j < availableGearboxes.length; j++) {
      configs.push({engine: availableEngines[i], gearbox : availableGearboxes[j]})
    }
  }
  return configs
}


/**
 *
 * @param {string} text
 * @returns {Array<Car>}
 */
export function searchCar(text) {
  return db.car.search(text)
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

  car.engine = engine
  return car
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
}