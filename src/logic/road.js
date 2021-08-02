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
    })
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