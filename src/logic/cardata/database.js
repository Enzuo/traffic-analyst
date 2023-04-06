import data from './database.json'

export const car = {
  list : () => data.cars,
  get : (id) => data.cars.find((car) => car.id === id),
}

export const engine = {
  get : (id) => data.engines.find((engine) => engine.id === id)
}