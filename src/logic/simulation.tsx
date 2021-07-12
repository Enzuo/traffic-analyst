import Car from "./car"

export function Simulation () {
  let elapsedTime = 0

  let cars = []
  
  const forward = (t : DOMHighResTimeStamp) => {
    let dt = Math.min(t - elapsedTime, 20)
    elapsedTime = t 

    if(cars.length < 1) {
      cars.push(Car())
    }

    cars.forEach(car => car.drive(t, dt))
  }

  const currentState = () => {
    return {
      elapsedTime,
      car : cars[0]
    }
  }

  return {
    forward,
    currentState
  }    
}