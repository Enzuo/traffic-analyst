import { convertPrice } from './converter'

const HouseholdIncome = {
  'usa' : [
    [1900, 750],
    [1910, 800],
    [1920, 1300],
    [1930, 1500],
    [1940, 1300],
    [1950, 3300],
    [1960, 5600],
    [1970, 9800],
    [1980, 17700],
    [1990, 30000],
    [2000, 42000],
    [2010, 49000],
    [2020, 68700],
  ],
  'uk' : [
    [1900, 85],
    [1910, 95],
    [1920, 200],
    [1930, 250],
    [1940, 220],
    [1950, 450],
    [1960, 700],
    [1970, 1200],
    [1980, 5200],
    [1990, 13500],
    [2000, 22000],
    [2010, 31000],
    [2020, 40000],
  ],
  'fr' : [
    [1900, 1200],       // Francs
    [1910, 1500],       // Francs
    [1920, 3000],       // Francs
    [1930, 5000],       // Francs
    [1940, 4500],       // Francs (impacted by WWII)
    [1950, 12000],      // Francs
    [1960, 18000],      // Francs
    [1970, 30000],      // Francs
    [1980, 65000],      // Francs
    [1990, 120000],     // Francs
    [1999, 125000],     // Francs
    [2000, 20000],      // Euros (conversion from francs to euros)
    [2010, 27000],      // Euros
    [2020, 36000],      // Euros
  ]
}

const Currencies = {
  'dollar' : {
    regex : [/(\d+.\d*)\$/, /\$(\d+.\d*)/],
    country : 'usa',
  },
  'pound' : {
    regex : /£(\d+.\d*)/,
    country : 'uk',
  },
  'franc' : {
    regex : [/(\d+.\d*)f/, /(\d+.\d*)fr/],
    country : 'fr',
  },
  'euro' : {
    regex : /(\d+.\d*)€/,
    country : 'fr',
  },
}

/**
 *
 * @param {string|number} price
 * @param {number} year
 * @param {string=} currency
 * @returns {[number, string]} [price now, currency]
 */

export function HistoricPrice(price, year, currency) {
  console.log('calling HistoricPrice', price)
  let priceAmount
  if(typeof price === 'string'){
    [priceAmount, currency] = parsePrice(price)
  }

  if(!currency || !year){
    return [priceAmount, null]
  }

  // country trend
  let country = Currencies[currency].country
  let incomeCurve = HouseholdIncome[country]
  let medianIncomeThen = interpolateY(incomeCurve, year)
  let medianIncomeNow = incomeCurve[incomeCurve.length-1][1]

  let priceRelativeToIncomeThen = priceAmount / medianIncomeThen

  let priceNow = medianIncomeNow * priceRelativeToIncomeThen

  console.log(price, year, priceRelativeToIncomeThen, medianIncomeThen, priceNow, medianIncomeNow)

  // convert price to unit
  let toCurrency = 'dollar'
  priceNow = convertPrice(priceNow, toCurrency, currency).value

  // return price
  priceNow = parseFloat(priceNow.toFixed(2))
  return [priceNow, toCurrency]
}


/**
 * From a price string return the amount and currency used
 * @param {string} price
 * @returns {[number, string]} [amount, currency]
 */
export function parsePrice(price) {
  price = price.replace(/,/g, '')
  price = price.replace(/ /g, '')
  let currencyNames = Object.keys(Currencies)

  for(let i=0; i<currencyNames.length; i++){
    let currency = Currencies[currencyNames[i]]
    let currencyMatch
    if(currency.regex instanceof Array){
      currency.regex.forEach(r => {
        currencyMatch = price.match(r) || currencyMatch
      })
    }
    else {
      currencyMatch = price.match(currency.regex)
    }
    if(currencyMatch){
      let amount = parseFloat(currencyMatch[1]) || null
      return [amount, currencyNames[i]]
    }
  }

  return [null, null]
}


// TODO curve lib
function interpolateY(dataPoints, x){
  var indexNextPoint = dataPoints.findIndex((curvePoint) => {
    return curvePoint[0] > x
  })
  // not found or first torque point was higher,
  // meaning the wanted rpm is before the torque curve if 0 or after if -1
  if (indexNextPoint <= 0) {
    if(indexNextPoint === 0 ){
      return dataPoints[0][1]
    }
    if(indexNextPoint === -1 ){
      return dataPoints[dataPoints.length-1][1]
    }
    return null
  }
  var prevPoint = dataPoints[indexNextPoint - 1]
  var nextPoint = dataPoints[indexNextPoint]

  var distX = nextPoint[0] - prevPoint[0]
  var distPercent = (x - prevPoint[0]) / distX
  var distY = nextPoint[1] - prevPoint[1]

  var y = prevPoint[1] + distY * distPercent

  return y
}

/**
 * Transform price in a more readable string
 * @param {number} price
 * @param {string} currency
 */
export function formatPrice(price, currency) {
  if(!price){
    return 'unknow'
  }
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}