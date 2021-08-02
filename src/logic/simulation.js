import Car from "./car"
import Driver from "./driver"
import Road from "./road"

export function Simulation () {
  let elapsedTime = 0

  let drivers = []
  let cars = []
  let road = Road()
  
  const forward = (t) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t 

    if(cars.length < 1) {
      let car = Car()
      let driver = Driver(car, road)

      drivers.push(driver)
      cars.push(car)
      road.addCar(car)
    }

    drivers.forEach(driver => driver.animate(t, dt))
    cars.forEach(car => car.animate(t, dt))
    road.animate(t, dt)
  }

  const currentState = () => {
    return {
      elapsedTime,
      car : cars[0],
      road : road.getState()
    }
  }

  return {
    forward,
    currentState
  }    
}