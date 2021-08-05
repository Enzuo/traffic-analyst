import Car from "./car"
import Driver from "./driver"
import Road from "./road"

export function Simulation () {
  let elapsedTime = 0
  let elapsedSimulationTime = 0

  let drivers = []
  let cars = []
  let road = Road()
  
  const carGenerator = Ticker()

  const init = () => {
    addCar(70,50)
    addCar(110,0)
  }

  const forward = (t) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t
    elapsedSimulationTime += dt

    // if(carGenerator.tickInterval(2000, elapsedSimulationTime)) {
    //   let idealSpeed = (70 + Math.random() * 40)
    //   addCar(idealSpeed)
    // }

    drivers.forEach(driver => driver.animate(t, dt))
    cars.forEach(car => car.animate(t, dt))
    road.animate(t, dt)
  }

  const addCar = (idealSpeed, position) => {
    idealSpeed /= 3.6

    let car = new Car({speed : idealSpeed})
    let driver = Driver({car, road, targetSpeed : idealSpeed})

    drivers.push(driver)
    cars.push(car)
    road.addCar(car, position)
  }

  const getState = () => {
    return {
      elapsedTime,
      car : cars[0],
      road,
    }
  }

  init()

  return {
    forward,
    getState
  }    
}

function Ticker() {
  let lastTick = 0
  return {
    tickInterval : (interval, t) => {
      if(t - lastTick >= interval){
        lastTick = t
        return true
      }
      return false
    }
  }
}