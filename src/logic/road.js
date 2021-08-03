export default function Road(){
  let cars = []

  function addCar(car) {
    car.position = 0
    cars.push(car)
  }

  function animate(t, dt) {
    cars.forEach(car => {
      // let carState = car.getState()
      let speed = car.state.speed / 3.6
      car.position += speed * (dt / 1000)

      // collisions
      const carInFront = getObjectInFrontOf(car)
      if(carInFront){
        if(carInFront.distance <= 4.1){
          car.position = carInFront.position - 4.1
          car.setSpeed(carInFront.speed)
        }
      }
    })
  }

  function getObjectInFrontOf(car){
    const carIndex = cars.findIndex(c => car.id === c.id)
    // const car = cars[carIndex]
    const carInFront = cars[carIndex-1]
    if(carInFront){
      return {...carInFront, speed : carInFront.state.speed, distance : carInFront.position - car.position}
    }
    return null
  }

  function getState() {
    return {cars}
  }


  return {
    addCar,
    getObjectInFrontOf,
    animate,
    getState,
  }
}