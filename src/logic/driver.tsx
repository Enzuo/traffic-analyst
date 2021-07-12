import Car from "./car"


export default function Driver () {

  let car = Car()

  let targetSpeed = 90


  function drive (dt) {
    if(car.speed < targetSpeed){
      return car.accelerate(1)
    }
    return car.accelerate(0)
  }

  return {
    car,
    drive,
  }
}