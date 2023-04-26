import * as data from './database.json'
import Fuse from 'fuse.js'


export const car = {
  list : () => data.cars,
  get : (id) => data.cars.find((car) => car.id === id),
  search : (text) => search(text, data)
}

export const engine = {
  get : (id) => data.engines.find((engine) => engine.id === id)
}



export function search(text, data) {
  let carsData = flattenCarFiles(data.cars)
  let fuse = new Fuse(carsData, {
    includeScore: true,
    // Search in `author` and in `tags` array
    keys: [
      'name',
      'trim',
      'brand',
      'year',
      'engine.name',
      'engine.hp',
    ]
  })

  return fuse.search(text).map(r => r.item)
}

export function flattenCarFiles (data) {
  // map cars to a searchable string
  let cars = data.reduce((arr, carFile) => {
    let cars = []
    cars.push(...splitCarTrimByEngine(carFile, 0))
    if(carFile.trims){
      carFile.trims.forEach((t, i) => {
        let tComplete = Object.assign({}, carFile, t)
        cars.push(...splitCarTrimByEngine(tComplete, i+1))
      })
    }

    return arr.concat(cars)
  }, [])

  return cars
}


function splitCarTrimByEngine(car, trimId){
  let cars = []
  let engineId = 0
  if(car.engine){
    cars.push(Object.assign({}, car, {engineId, trimId}))
    engineId++
  }
  if(car.engines){
    cars.push(...car.engines.map((e) => {
      let c = Object.assign({}, car, {...e, engineId, trimId})
      engineId++
      return c
    }))
  }
  return cars
}