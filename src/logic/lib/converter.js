const conversionTable = [
  ['kw', 'hp', 1.341, 'bhp', 1.359, 'ps', 1.35962],
  ['nm', 'ftlb', 0.7376, 'mkg', 0.10197],
]


const priceConversionTable = ['dollar', 'euro', 0.90, 'pound', 0.76, 'franc', 0.9] // HACK franc ratio same as euro as conversion is just used now

const lengthConversionTable = ['m', 'cm', 100, 'inches', 39.3701]


/**
 * convert from one unit of a category to another
 * @param {number|string} value
 * @param {string=} unit unit to convert to (default if not provided)
 * @param {string=} fromUnit value is expressed using this unit (useful if value is a number not expressed in default unit)
 * @returns
 */
export function convertQty(value, unit, fromUnit){
  if(typeof value === 'string'){
    const match = value.match(/(\d+\.*\d+)(\D*)/);
    fromUnit = match[2]
    value = parseFloat(match[1])
  }

  if(!unit && !fromUnit){
    return {
      value,
      unit : '?',
    }
  }

  // TODO use a conversion table ex: [kw, hp, 0,7][nm, lbft, 1.2]
  // Find dimension we want to work with
  // let dimension = conversionTable.find(
  //   dim => dim.some(
  //     i => typeof i === 'string' && (new RegExp(`^${fromUnit}$`, 'i').test(i) || new RegExp(`^${unit}$`, 'i').test(i))
  // ))

  // Find dimension & ratios we want to work with
  let ratios
  let i=0
  while(!ratios && i < conversionTable.length) {
    ratios = findRatiosForUnits(conversionTable[i], unit, fromUnit)
    i++
  }

  // convert with ratios
  value = value / ratios.fromUnitRatio * ratios.toUnitRatio

  return {
    value,
    unit : ratios.toUnit
  }
}

/**
 * Convert value in the currency domain
 * @param {number} value
 * @param {string} toUnit
 * @param {string} fromUnit
 * @returns
 */
export function convertPrice(value, toUnit, fromUnit){
  return convertInDomain(priceConversionTable, value, toUnit, fromUnit)

}

/**
 * Convert between length values
 * @param {number} value
 * @param {string} toUnit
 * @param {string} fromUnit
 * @returns
 */
export function convertLength(value, toUnit, fromUnit){
  return convertInDomain(lengthConversionTable, value, toUnit, fromUnit)
}

function convertInDomain(domain, value, toUnit, fromUnit){
  var ratios = findRatiosForUnits(domain, toUnit, fromUnit)
  // convert with ratios
  value = value / ratios.fromUnitRatio * ratios.toUnitRatio

  return {
    value,
    unit : ratios.toUnit
  }
}

function findRatiosForUnits(dimension, toUnit, fromUnit){
  let toUnitRatio
  let fromUnitRatio
  for(var i=0; i < dimension.length; i++){
    var k = dimension[i]
    if(typeof k === 'number'){
      continue
    }
    if(toUnit){
      if(!toUnitRatio && new RegExp(`^${toUnit}$`, 'i').test(k)){
        // first unit is default unit and has a ratio of 1 (with itself)
        if(i===0){
          toUnitRatio = 1
        }
        else {
          toUnitRatio = dimension[i+1]
        }
      }
    }
    else {
      toUnit = dimension[0]
      toUnitRatio = 1
    }
    if(fromUnit){
      if(!fromUnitRatio && new RegExp(`^${fromUnit}$`, 'i').test(k)){
        // first unit is default unit and has a ratio of 1 (with itself)
        if(i===0){
          fromUnitRatio = 1
        }
        else {
          fromUnitRatio = dimension[i+1]
        }
      }
    }
    else {
      fromUnit = dimension[0]
      fromUnitRatio = 1
    }

    // if fromUnitRatio also found
    if(toUnitRatio && fromUnitRatio){
      return {
        toUnit,
        toUnitRatio,
        fromUnit,
        fromUnitRatio,
      }
    }
  }
  return null
}