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
      const carInFront = getObjectInFrontOf(car.carLogic)
      if(carInFront){
        if(carInFront.distance <= 4.1){
          car.position = carInFront.position - 4.1
          car.carLogic.setSpeed(carInFront.speed)
        }
      }
    })
  }

  function getObjectInFrontOf(carLogic){
    const carIndex = cars.findIndex(c => carLogic.id === c.carLogic.id)
    const car = cars[carIndex]
    const carInFront = cars[carIndex-1]
    if(carInFront){
      return {...carInFront, speed : carInFront.carLogic.getState().speed, distance : carInFront.position - car.position}
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