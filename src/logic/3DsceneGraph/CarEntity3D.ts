import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadCarModel, loadModel, loadWheelModel} from './loader'
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
  public object : THREE.Object3D
  public carBody : THREE.Mesh
  public wheels : Wheel[]
  public propeller : THREE.Mesh

  constructor (car: CarEntity, {group, body, wheels, misc, propeller}, wheelModel, color?) {
    this.carEntity = car
    this.object = group
    this.carBody = body
    this.propeller = propeller

    //Create wheels
    this.wheels = []
    wheels.forEach((w) => {
      let scale = car.props.wheelScale ? car.props.wheelScale[w.index-1] : 1
      const wheelDiameter = car.props.wheelDiameter
      let wheel = new Wheel(w.obj, wheelModel, wheelDiameter * scale, w.index, w.isRight, false)
      this.wheels.push(wheel)
      this.object.add(wheel)
    })


    // Fix position
    const {wheelDiameter} = car.props
    this.object.position.y += wheelDiameter/250


    // Hide misc
    misc.forEach((m) => {
      this.object.remove(m.obj)
      const miscName = new RegExp(m.name, 'i')
      if(car.props.modelMisc && miscName.test(car.props.modelMisc)){
        // Create spare wheels
        if(m.isWheel){
          const wheelDiameter = car.props.wheelDiameter
          let wheel = new Wheel(m.obj, wheelModel, wheelDiameter)
          this.carBody.add(wheel)
        }
        else {
          this.carBody.add(m.obj)
        }
      }
    })


    // Change color
    const texture = this.carBody.material.map;
    const newTexture = changeTextureColor(texture, color)
    this.carBody.material.map = newTexture

    // Add shadow
    this.carBody.castShadow = true
    this.carBody.receiveShadow = false

  }


  animate(dt){
    if(!this.object) return

    const {speed, acceleration} = this.carEntity.state
    const {wheelDiameter} = this.carEntity.props
    let wheelTurnsPerS = getWheelTurns(speed, wheelDiameter)
    let wheelTurnOverDt = wheelTurnsPerS * (dt/1000) * Math.PI * 2
    let maxRotationSpeed = 0.25 // avoid rolling backward effect

    for(let i=0; i<this.wheels.length; i++){
      let wheel = this.wheels[i]
      wheel.rotateX(Math.min(maxRotationSpeed, wheelTurnOverDt))
    }

    this.object.position.z += speed * dt / 1000

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

export class Wheel extends THREE.Object3D{
  public object : THREE.Object3D
  public side
  public wheelIndex : number
  public wheelType : WheelTypes

  constructor(empty : THREE.Object3D, wheelModel : THREE.Object3D, wheelDiameter, wheelIndex?, isRightWheel?, useRotation=true) {
    super()

    this.position.copy(empty.position)
    if(useRotation){
      this.rotation.copy(empty.rotation)
    }

    this.object = wheelModel.clone()
    let scale = calcWheelScale(wheelDiameter, wheelModel)
    this.object.scale.set(isRightWheel ? -scale : scale, scale, scale)
    this.wheelIndex = wheelIndex
    if(wheelIndex <= 2){
      this.wheelType = WheelTypes.Front
    }
    this.add(this.object)
  }
}


function cloneWheel(wheel, empty, useRotation=true){
  let carWheel = wheel.clone()
  carWheel.position.copy(empty.position)
  if(useRotation){
    console.log('rotation', empty.rotation)
    carWheel.rotation.copy(empty.rotation)
  }
  return carWheel
}


/**
 *
 * @param {number} wheelDiameter {cm}
 * @param {THREE.Object3D} wheel
 * @returns {number} scale
 */
function calcWheelScale(wheelDiameter, wheel){
  const modelDiameter = wheel.geometry.boundingBox.max.z * 2 * 100
  return wheelDiameter ? wheelDiameter/modelDiameter : 1
}


export async function createCarEntity3D (carEntity : CarEntity, color?) {
  let wheelModel
  const car = carEntity.props
  return loadWheelModel(car.modelWheel)
  .then((m) => wheelModel = m)
  .then(() => loadCarModel(car))
  .then((carModel) => {
    return new CarEntity3D(carEntity, carModel, wheelModel, color)
  })
}





