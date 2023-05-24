import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'
import { loadDefaultCarModelProc } from './proceduralCar'


import type { CarEntity } from '@/logic/carLogic/carEntity';

/**
 * @typedef {import('./sceneGraph').AnimatedObject} AnimatedObject
 */

/**
 *
 * @param {*} car
 * @param {number=} positionX
 * @param {string=} color
 * @returns {Promise<AnimatedObject>}
 */
export class CarEntity3D {

  public carEntity : CarEntity
  public objectGroup : THREE.Object3D
  public carBody : THREE.Mesh
  public wheels : Wheel[]
  public propeller : THREE.Mesh

  constructor (car: CarEntity, {group, body, wheels, misc, propeller}, wheelModel, color?) {
    this.carEntity = car
    this.objectGroup = group
    this.carBody = body
    this.propeller = propeller

    //Create wheels
    this.wheels = []
    wheels.forEach((w) => {
      let scale = car.props.wheelScale ? car.props.wheelScale[w.index-1] : 1
      let wheel = new Wheel(w.obj, wheelModel, scale, w.index, w.isRight)
      this.wheels.push(wheel)
      this.objectGroup.add(wheel.object)
    })

  }


  animate(dt){
    if(!this.objectGroup) return

    const {speed, acceleration} = this.carEntity.state
    const {wheelDiameter} = this.carEntity.props
    let wheelTurnsPerS = getWheelTurns(speed, wheelDiameter)
    let wheelTurnOverDt = wheelTurnsPerS * (dt/1000) * Math.PI * 2
    let maxRotationSpeed = 0.25 // avoid rolling backward effect

    for(let i=0; i<this.wheels.length; i++){
      let wheel = this.wheels[i]
      wheel.rotation.x += Math.min(maxRotationSpeed, wheelTurnOverDt)
    }

    this.objectGroup.position.z += speed * dt / 1000

    // Add body tilt
    let tilt = (acceleration / 4) * (Math.PI/180)
    this.carBody.rotation.x = -tilt

    // Turn propeller
    if (this.propeller) {
      const {engineRpm} = this.carEntity.state
      let propellerTurnOverDt = engineRpm / 60 * (dt/1000) * Math.PI * 2
      // TODO rotate in object own rotation matrix
      this.propeller.rotation.z +=  Math.min(maxRotationSpeed, propellerTurnOverDt)
    }
  }
}

export enum WheelTypes {
  Front,
  Rear,
  Spare,
}

export class Wheel {
  public object : THREE.Object3D
  public rotation : THREE.Euler
  public position : THREE.Vector3
  public quaternion : THREE.Quaternion
  public side
  public index
  public wheelType : WheelTypes

  constructor(empty : THREE.Object3D, model : THREE.Object3D, scale, index, isRightWheel) {
    this.object = cloneWheel(model, empty, false)
    this.object.scale.set(isRightWheel ? -scale : scale, scale, scale)
    this.index = index
    if(index <= 2){
      this.wheelType = WheelTypes.Front
    }
    this.rotation = this.object.rotation
    this.position = this.object.position
    this.quaternion = this.object.quaternion
  }
}


function cloneWheel(wheel, empty, useRotation=true){
  console.log('empty', empty)
  let carWheel = wheel.clone()
  carWheel.position.copy(empty.position)
  if(useRotation){
    carWheel.rotation.copy(empty.rotation)
  }
  // if(!!empty.name.match(/R$/g)){
  //   carWheel.scale.x *= -1
  // }
  return carWheel
}






