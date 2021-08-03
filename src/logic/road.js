export default function Road(){
  let cars = []
  let index = 0

  function addCar(car) {
    cars.push({
      id: index++, 
      carLogic: car, 
      position: 0
    })
  }

  function animate(t, dt) {
    cars.forEach(car => {
      let carState = car.carLogic.getState()
      let speed = carState.speed / 3.6
      car.position += speed * (dt / 1000)

      // collisions
      const carInFront = getObjectInFrontOf(car)
      if(carInFront){
        if(carInFront.position <= car.position + 4.1){
          car.position = carInFront.position - 4.1
          car.carLogic.setSpeed(carInFront.carLogic.getState().speed)
        }
      }
    })
  }

  function getObjectInFrontOf(car){
    const carIndex = cars.findIndex(c => car.id === c.id)
    return cars[carIndex-1]
  }

  function getState() {
    return {cars}
  }


  return {
    addCar,
    animate,
    getState,
  }
}