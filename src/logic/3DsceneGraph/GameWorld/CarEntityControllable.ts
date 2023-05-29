import * as THREE from 'three'

import { CarEntity } from "@/logic/carLogic/CarEntity"
import type { IControllable } from "./interfaces/IControllable"
import { createCarEntity3D, type CarEntity3D } from "@/logic/3DsceneGraph/CarEntity3D"
import { CarPhysics } from "./CarPhysics"
import * as Utils from './Utils'


export class CarEntityControllable extends CarEntity implements IControllable {

  public carPhysic : CarPhysics
  public carModel : CarEntity3D

  public brakeLights : THREE.Mesh
  public camera

  // controls
  public steeringControl = new SteeringControl()
  public throttle = 0
  public brake = 0

  constructor(car, scene, physicsWorld) {
    super(car)

    createCarEntity3D(this).then((carEntity3D) => {
      scene.add(carEntity3D.object)
      this.carModel = carEntity3D
      this.carPhysic = new CarPhysics (physicsWorld, carEntity3D.carBody, carEntity3D.wheels)
    })

    // create brakes light
    // let brakelightGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    // const brakeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    // const brakeLight = new THREE.Mesh(brakelightGeometry, brakeMaterial);
    // brakeLight.position.set(0, 1, -2.1)
    // this.brakeLights = brakeLight

    // carEntity3D.carBody.add(brakeLight);
    // this.camera = camera
  }

  animate(delta) {
    if(!this.carPhysic) return
    this.steeringControl.update(delta)
    this.carPhysic.steeringValue = this.steeringControl.steeringValue


    // get engine force
    var engineForce = 7000 * this.throttle
    this.carPhysic.forceValue = engineForce

    // update brake lights
    // this.brakeLights.quaternion.copy(this.camera.quaternion)
    // this.brakeLights.visible = this.brake > 0 ? true : false
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
      this.throttle = 1
    }
    else {
      this.throttle = 0
    }

    if(actions['down']){
      this.brake = 1
    }
    else {
      this.brake = 0
    }
  }
}






class SteeringControl {
  public steeringValue = 0
  public steeringAmplitude = 0.8
  public steeringDirection = 0


  update(delta){
    // add steering in direction
    let newSteeringValue = (this.steeringValue + 0.1 * this.steeringDirection)
    this.steeringValue = Math.min(Math.max(newSteeringValue, -this.steeringAmplitude), this.steeringAmplitude)
  }

  steer(direction, value=null) {
    if(typeof value === 'number' && value > 0){
      this.steeringValue = direction === 'left' ? value : -value;
      this.steeringDirection = 0
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



