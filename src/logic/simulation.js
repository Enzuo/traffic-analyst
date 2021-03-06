import Car from "./car"
import Driver from "./driver"
import Road from "./road"
import Utils from "./utils"

export function Simulation () {
  let elapsedTime = 0
  let elapsedSimulationTime = 0

  let drivers = []
  let cars = []
  let road = Road()
  
  const carGenerator = Utils.createTicker()

  const init = () => {
    addCar(50,100)
    addCar(110,0)
  }

  const forward = (t) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t
    elapsedSimulationTime += dt

    if(carGenerator.tickInterval(2000, elapsedSimulationTime)) {
      let cruisingSpeed = (70 + Math.random() * 40)
      addCar(cruisingSpeed)
    }

    drivers.forEach(driver => driver.animate(t, dt))
    cars.forEach(car => car.animate(t, dt))
    road.animate(t, dt)
  }

  const addCar = (cruisingSpeed, position) => {
    cruisingSpeed /= 3.6
    const initialSpeed = cruisingSpeed
    let car = new Car({speed : initialSpeed})
    let driver = Driver({car, road, cruisingSpeed})

    drivers.push(driver)
    cars.push(car)
    road.addCar(car, position)
  }

  const getState = () => {
    return {
      elapsedTime,
      cars,
      drivers,
      road,
    }
  }

  function getCar(id){
    let carIndex = cars.findIndex(c => id === c.id)
    // TODO kinda hackish to get the driver
    return {car: cars[carIndex], driver: drivers[carIndex]}
  }

  init()

  return {
    forward,
    getState,
    getCar,
  }    
}

