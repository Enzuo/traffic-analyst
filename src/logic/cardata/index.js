import * as db from './database.js'

export function listCars() {
  return db.car.list()
}

export function getCar(id) {
  let car = db.car.get(id)

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

  return Object.assign(defaultCar, car)
}



const defaultCar = {
  weight : 1000,
  dragCoef: 0.25, 
  dragArea: 2, 
  brakePadsForce: 12000,
}