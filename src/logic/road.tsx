export default function Road(){
  let cars = []

  function addCar(car) {
    cars.push({car, position: 0})
  }

  function animate(t, dt) {
    cars.forEach(car => {
      let carStatus = car.car.getState()
      let speed = carStatus.speed / 3.6
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