import Car from "./car"
import Driver from "./driver"
import Road from "./road"

export function Simulation () {
  let elapsedTime = 0

  let drivers = []
  let cars = []
  let road = Road()
  
  const forward = (t : DOMHighResTimeStamp) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t 

    if(cars.length < 1) {
      let driver = Driver()
      drivers.push(driver)
      cars.push(driver.car)
      road.addCar(driver.car)
    }

    drivers.forEach(driver => driver.drive(t, dt))
    cars.forEach(car => car.drive(t, dt))
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