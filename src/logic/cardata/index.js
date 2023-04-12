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
  let car = db.car.get(carId)
  if (!car) throw Error('car not found')

  // add base trim to the trims
  const trims = [].concat({trim: car.trim || 'default'}, car.trims || [])
  // apply selected trim
  car = Object.assign({}, car, trims[trimId])

  // add default engine to the engines
  const engines = [].concat({engine: car.engine}, car.engines || [])
  // apply selected engine
  car = Object.assign({}, car, engines[engineId])

  car = completeEngineData(car)

  console.log('getting car', car, trims, engines)


  return Object.assign(Object.create(defaultCar), car, {trims, engines})
}


function completeEngineData(car) {
  // get linked engine
  if(typeof car.engine === 'string'){
    let engineId = car.engine
    let engine = db.engine.get(engineId)
    car.engine = engine
  }

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