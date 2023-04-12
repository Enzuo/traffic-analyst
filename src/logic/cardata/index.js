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
 * @param {string} id
 * @returns {Array<Car>}
 */
export function getCarTrims(id) {
  let car = db.car.get(id)
  if (!car) throw Error('car not found')

  // extract trims
  const trims = car.trims || []
  const trimsInherited = trims.map((t) => Object.assign({}, car, t))
  let carTrims = [].concat([car], trimsInherited)


  carTrims = carTrims.map(c => {
    completeEngineData(c)
    return Object.assign(Object.create(defaultCar), c)
  })

  return carTrims
}

/**
 * 
 * @param {string} id 
 * @param {string|number} idTrim 
 * @returns {Car}
 */
export function getCar(id, idTrim=0){
  const trims = getCarTrims(id)
  if(typeof idTrim === 'number'){
    return trims[idTrim]
  }
  return trims.find(t => t.trim === idTrim)
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