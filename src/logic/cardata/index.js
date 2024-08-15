import { parseEngineSpec, convertQty } from '../carLogic/carlib.js'
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
 * @property {engine} engine
 * @property {gearbox} gearbox
 * @property {CarConfig[]} configs -- all available configs
 */


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
  const trimsOptions = [].concat({trim: car.trim || 'default'}, car.trims || [])
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
 * Generate all possible configs for a car
 * based on engines and gearboxes directly defined in the data
 * @param {CarData} car
 * @returns {CarConfig[]}
 */
function generateConfigs(car){
  var configs = []
  var availableEngines = [].concat(car.engine, ...car.engines || []).filter(Boolean)
  var availableGearboxes = [].concat(car.gearbox, ...car.gearboxes || []).filter(Boolean)

  if(car.configs){
    // default config with default engine/default gearbox
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

  engine.power = convertQty(engine.power).value


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
  gearbox: {
    gearRatio : [4,2,1],
    driveRatio : 4,
  }
}