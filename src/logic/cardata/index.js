import * as db from './database.js'

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
export function getCar(carId, trimId=0, engineId=0) {
  console.log('getting car', carId, trimId, engineId)
  let car = db.car.get(carId)
  if (!car) throw Error('car not found')

  const detailedEngines = listDetailedEngines(car)

  // regroup base trim with additionals trims
  const trimsOptions = [].concat({trim: car.trim || 'default'}, car.trims || [])
  // apply selected trim
  car = Object.assign({}, car, trimsOptions[trimId])

  // regroup engines options with default engine & engines
  const enginesOptions = [].concat({engine: car.engine}, car.engines || [])
  enginesOptions.forEach((eOpts) => {
    let engine = eOpts.engine
    if(!isEngineDetailed(engine)){
      let detailedEngine = findDetailedEngine(engine, detailedEngines)
      eOpts.engine = detailedEngine
    }
  })

  console.log('apply engineId', engineId)
  // apply selected engine
  if(engineId >= enginesOptions.length){
    engineId = 0
  }
  car = Object.assign({}, car, enginesOptions[engineId])

  car = completeEngineData(car)



  return Object.assign(Object.create(defaultCar), car, {trims : trimsOptions, engines : enginesOptions})
}





function listDetailedEngines(car) {
  let engines = []

  engines = engines.concat(listDetailedEnginesInASingleTrim(car))

  if(car.trims){
    for(var i=0; i<car.trims.length; i++){
      let trim = car.trims[i]
      engines = engines.concat(listDetailedEnginesInASingleTrim(trim))
    }
  }

  return engines
}

function listDetailedEnginesInASingleTrim(car){
  const engines = []
  if(car.engine && isEngineDetailed(car.engine)){
    engines.push(car.engine)
  }

  if(car.engines){
    for(var i=0; i<car.engines.length; i++){
      let engine = car.engines[i].engine
      if(isEngineDetailed(engine)){
        engines.push(engine)
      }
    }
  }

  console.log('found engines', engines)
  
  return engines
}

function isEngineDetailed(engine){
  return engine ? !!engine.torqueX : false
}

function findDetailedEngine(engine, detailedEngine){
  // get linked engine
  if(typeof engine === 'string'){
    let engineId = engine
    return db.engine.get(engineId)
  }
  return detailedEngine.find(e => {
    return e.name === engine.name
  })
}




function completeEngineData(car) {

  // compute engine torqueCurve
  if(!car.engine.torqueCurve){
    let curve = []
    for(let i=0; i < car.engine.torqueX.length; i++){
      let xMultiplier = car.engine.torqueXMultiplier ? car.engine.torqueXMultiplier : 1
      curve.push([car.engine.torqueX[i] * xMultiplier, car.engine.torqueY[i]])
    }
    car.engine.torqueCurve = curve
  }

  return car
}



const defaultCar = {
  weight : 1000,
  dragCoef: 0.25, 
  dragArea: 2, 
  brakePadsForce: 12000,
}