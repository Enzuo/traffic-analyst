import { CarEntity, updateForces } from "../carLogic/CarEntity";
import data from "../cardata";
import { Simulation } from "../simulation2";

export default function followingDistanceSim() {
  let options = {
    reactionTime: 1,
    speed: 27,
    followingDistance: 40,
    brakeApplyTime: 0.5,
  };

  const simulation = Simulation();


  const firstCar = new CarEntity(data.car.get("renault_zoe"));
  const followingCar = new CarEntity(data.car.get("renault_zoe"));
  const cars = [firstCar, followingCar]

  // Init
  updateCarsDefaultStatus()

  function setOptions(opts) {
    options = Object.assign(options, opts);
    updateCarsDefaultStatus()
    // TODO simulation time not reset
  }

  function updateCarsDefaultStatus(){
    const firstCarPos = 50
    if(simulation.isPlaying === false) {
      firstCar.state.position = firstCarPos
      followingCar.state.position = firstCarPos - options.followingDistance
      firstCar.state.speed = 27
      followingCar.state.speed = 27
    }
  }

  function animate(t, dt) {
    const brakeValue = linearInterpolation(
      t/1000,
      options.reactionTime,
      options.reactionTime + options.brakeApplyTime,
      0,
      1
    );
    firstCar.state.brakeInput = brakeValue;

    const followingCarBrakeValue = linearInterpolation(
      t/1000,
      options.reactionTime + options.reactionTime,
      options.reactionTime + options.reactionTime + options.brakeApplyTime,
      0,
      1
    );
    followingCar.state.brakeInput = followingCarBrakeValue;

    // Animate cars
    cars.forEach((car, index) => {
      updateForces(car, dt)
      if(car.state.brakeInput <= 0 ) {
        car.state.speed = options.speed
      }
      const speed = car.state.speed
      car.state.position += speed * (dt / 1000)

      //auto stop simulation
      if(followingCar.state.speed === 0 ){
        simulation.stop()
      }
    })
    // detect collision
    // TODO
  }
  simulation.subscribeTick(animate);

  return {
    setOptions,
    simulation,
    cars
  };
}

function linearInterpolation(x, xMin, xMax, yMin, yMax) {
  // Calculate the proportion of x between xMin and xMax
  const proportion = (x - xMin) / (xMax - xMin);

  // Calculate the corresponding y value using linear interpolation
  let y = yMin + proportion * (yMax - yMin);

  // Clamp Y
  y = Math.min(Math.max(y, yMin), yMax);

  return y;
}
