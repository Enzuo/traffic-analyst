import Car from "./car"
import Driver from "./driver"
import Road from "./road"

export function Simulation () {
  let elapsedTime = 0
  let elapsedSimulationTime = 0

  let drivers = []
  let cars = []
  let road = Road()
  
  const forward = (t) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t
    elapsedSimulationTime += dt

    if(tickInterval(2000, elapsedSimulationTime)) {
      addCar()
    }

    drivers.forEach(driver => driver.animate(t, dt))
    cars.forEach(car => car.animate(t, dt))
    road.animate(t, dt)
  }

  let lastTick = 0
  const tickInterval = (interval, t) => {
    if(t - lastTick >= interval){
      lastTick = t
      return true
    }
    return false
  }

  const addCar = () => {
    let idealSpeed = 70 + Math.random() * 40

    let car = new Car({speed : idealSpeed})
    let driver = Driver({car, road, targetSpeed : idealSpeed})

    drivers.push(driver)
    cars.push(car)
    road.addCar(car)
  }

  const getState = () => {
    return {
      elapsedTime,
      car : cars[0],
      road,
    }
  }

  return {
    forward,
    getState
  }    
}