
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
