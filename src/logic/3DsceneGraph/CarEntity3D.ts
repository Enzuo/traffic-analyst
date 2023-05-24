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

  constructor (car: CarEntity, {group, body, wheels, propeller}, color?) {
    this.carEntity = car
    this.objectGroup = group
    this.carBody = body
    this.wheels = wheels
    this.propeller = propeller
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

  constructor(model : THREE.Object3D, empty : THREE.Object3D, scale, index) {
    this.object = cloneWheel(model, empty, false)
    this.object.scale.set(scale,scale,scale)
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
  let carWheel = wheel.clone()
  carWheel.position.copy(empty.position)
  if(useRotation){
    carWheel.rotation.copy(empty.rotation)
  }
  if(!!empty.name.match(/R$/g)){
    carWheel.scale.x *= -1
  }
  return carWheel
}



export function loadCarModel(car, color) {
  // MODELS
  let carObject
  let body
  let propeller
  let wheels = []
  let wheelModel : THREE.Object3D
  let carModelName = car.props.model
  let wheelModelName = car.props.modelWheel

  let promiseObject =
  loadWheelModel(car)
  .then((model) => {
    wheelModel = model
  })
  .then(() => loadModel(carModelName))
  .catch(() => loadDefaultCarModelProc(car))
  .then((gltf) => {
    carObject = gltf.scene ? gltf.scene : gltf

    let wheelDiameter = car.props.wheelDiameter || 63

    // Initial position
    // carObject.position.x = positionX
    carObject.position.y += wheelDiameter/250


    const miscObjects = []

    carObject.traverse((a) => {

      // MISC
      const miscObj = a.name.match(/^misc(\w*)/i)
      if(miscObj){
        miscObjects.push({obj: a, name: miscObj[1]})
        return
      }

      // WHEELS
      let matchWheel = a.name.match(/Wheel(\d+)/)
      if(matchWheel){
        let wheelIndex = matchWheel[1]
        let scale = 1
        if(car.props.wheelScale){
          scale = car.props.wheelScale[wheelIndex-1] || 1
        }
        let wheel = new Wheel(wheelModel, a, scale, wheelIndex)
        carObject.add(wheel.object)
        wheels.push(wheel)
      }

      if ( a instanceof THREE.Mesh ) {
        a.castShadow = true
        a.receiveShadow = false
        const texture = a.material.map;
        const newTexture = changeTextureColor(texture, color)
        a.material.map = newTexture
      }

      // body
      if(a.name.indexOf('Body') >= 0){
        body = a
      }

      if(a.name.indexOf('Propeller') >= 0){
        propeller = a
      }
    })

    miscObjects.forEach((m) => {
      carObject.remove(m.obj)
      const miscName = new RegExp(m.name, 'i')
      if(car.props.modelMisc && miscName.test(car.props.modelMisc)){
        let isWheel = m.name.indexOf('Wheel') >= 0
        if(isWheel){
          body.add(cloneWheel(wheelModel, m.obj))
          return
        }
        body.add(m.obj)
      }
    })

    return carObject
  })

  return promiseObject.then((object) => {return {group : object, body, wheels, propeller}})
}


async function loadWheelModel (car : CarEntity) : Promise<THREE.Object3D> {
  const wheelName = car.props.modelWheel

  return loadModel(wheelName)
  .catch(async (e) => {
    const wheelScene = await loadModel('wheel')

    // scale default wheel
    const defaultWheelDiameter = 63
    const wheelDiameter = car.props.wheelDiameter
    if(wheelDiameter){
      let r = wheelDiameter/defaultWheelDiameter
      wheelScene.scene.children[0].scale.set(r, r, r)
    }

    return wheelScene
  })
  .then((wheelScene) => {
    const wheelModel = wheelScene.scene.children[0]
    wheelModel.material.color = new THREE.Color(0x333333)
    return wheelModel
  })
}
