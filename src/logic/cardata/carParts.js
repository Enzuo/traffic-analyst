import { parseEngineSpec } from '@/logic/lib/carlib.js'
import { convertQty } from '@/logic/lib/converter.js'

import DATABASE from './database.js'

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
export function extractGearboxesFrom(cardata) {
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
 * @param {*} engine engine to check
 * @returns {boolean}
 */
export function isEngineDetailed(engine){
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


export function completeEngineData(car) {
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
 * Find the engine best matching the given engine name
 * @param {engine|string} engine
 * @returns {engine|null}
 */
export function findEngine(engine) {
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

  let matchingEngines = DATABASE.engine.filter(e => {
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