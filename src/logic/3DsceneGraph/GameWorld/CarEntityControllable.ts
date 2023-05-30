import * as THREE from 'three'

import { CarEntity } from "@/logic/carLogic/CarEntity"
import type { IControllable } from "./interfaces/IControllable"
import { createCarEntity3D, type CarEntity3D } from "@/logic/3DsceneGraph/CarEntity3D"
import { CarPhysics } from "./CarPhysics"
import * as Utils from './Utils'


export class CarEntityControllable extends CarEntity implements IControllable {

  public carPhysic : CarPhysics
  public carModel : CarEntity3D

  // controls
  public steeringControl = new SteeringControl()
  public throttleInput = 0
  public brakeInput = 0

  constructor(car, scene, physicsWorld) {
    super(car)

    createCarEntity3D(this).then((carEntity3D) => {
      scene.add(carEntity3D.object)
      this.carModel = carEntity3D
      this.carPhysic = new CarPhysics (physicsWorld, carEntity3D.carBody, carEntity3D.wheels, car.width/1000)
    })
  }

  animate(delta) {
    if(!this.carPhysic) return
    this.steeringControl.update(delta, this.carPhysic.speed)
    this.carPhysic.steeringValue = this.steeringControl.steeringValue


    // get engine force
    var engineForce = 7000 * this.throttleInput
    this.carPhysic.forceValue = engineForce

    // get brake force
    var brakeForce = 12000 * this.brakeInput
    this.carPhysic.brakeForceValue = brakeForce

    // update brake lights
    this.carModel.updateLights(this.brakeInput)
    this.carPhysic.animate(delta)

    // update model to represent the physics simulation
    this.carModel.carBody.position.copy(Utils.threeVector(this.carPhysic.physicsBody.position))
    this.carModel.carBody.quaternion.copy(Utils.threeQuat(this.carPhysic.physicsBody.quaternion))

    this.carModel.wheels.forEach((wheel, index) => {
      // this.carPhysic.rayCastVehicle.updateWheelTransform(index);
			let transform = this.carPhysic.rayCastVehicle.wheelInfos[index].worldTransform;

      wheel.position.copy(Utils.threeVector(transform.position));
			wheel.quaternion.copy(Utils.threeQuat(transform.quaternion));
    })
  }

  // triggerAction(action, isPressed, value) {
  //   switch(action){
  //     case 'left':
  //       this.steeringControl.steer(isPressed ? 'left' : 'center')
  //       break
  //     case 'right':
  //       this.steeringControl.steer(isPressed ? 'right' : 'center')
  //       break
  //     case 'up':
  //       this.throttle = isPressed ? 1 : 0
  //   }
  // }

  updateActions(actions) {
    if(actions['left']){
      this.steeringControl.steer('left', actions['left'])
    }
    else if(actions['right']){
      this.steeringControl.steer('right', actions['right'])
    }
    else {
      this.steeringControl.steer('center')
    }

    if(actions['up']){
      this.throttleInput = 1
    }
    else {
      this.throttleInput = 0
    }

    if(actions['down']){
      this.brakeInput = 1
    }
    else {
      this.brakeInput = 0
    }
  }
}






class SteeringControl {
  public steeringValue = 0
  public steeringAmplitude = 0.8
  public steeringDirection = 0


  update(delta, carSpeed){
    // add steering in direction
    let newSteeringValue = (this.steeringValue + 0.1 * this.steeringDirection)

    // auto recenter wheels
    if(this.steeringDirection === 0 && carSpeed > 0.1){
      let currentDirection = Math.sign(this.steeringValue)
      let steerResetSpeed = Math.min(Math.max(carSpeed / 7, 0.1), 1)
      newSteeringValue -= currentDirection * 0.05 * steerResetSpeed
    }


    this.steeringValue = Math.min(Math.max(newSteeringValue, -this.steeringAmplitude), this.steeringAmplitude)
  }

  steer(direction, value=null) {
    if(typeof value === 'number' && value > 0){
      this.steeringValue = direction === 'left' ? value : -value;
      this.steeringDirection = null
      return
    }
    switch(direction){
      case 'left':
        this.steeringDirection = 1
        break
      case 'right':
        this.steeringDirection = -1
        break
      case 'center':
        this.steeringDirection = 0
        break;
    }
  }
}



