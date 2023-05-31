import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadCarModel, loadModel, loadWheelModel} from './loader'
import {changeTextureColor} from './texture'
import { loadDefaultCarModelProc } from './proceduralCar'


import type { CarEntity } from '@/logic/carLogic/CarEntity';

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

  // lights
  public brakeLights : THREE.Object3D[]
  public reverseLights : THREE.Object3D[]

  constructor (car: CarEntity, {group, body, wheels, misc, propeller}, wheelModel, color?) {
    this.carEntity = car
    this.object = group
    this.carBody = body
    this.propeller = propeller

    // Create wheels
    this.wheels = []
    wheels.forEach((w) => {
      let scale = car.props.wheelScale ? car.props.wheelScale[w.index-1] : 1
      const wheelDiameter = car.props.wheelDiameter
      let wheel = new Wheel(w.obj, wheelModel, wheelDiameter * scale, w.index, w.isRight, false)
      this.wheels.push(wheel)
      this.object.add(wheel)
    })

    // Lights
    this.brakeLights = []
    const brakeLight1 = createLightObject('redlight', [0.7, 0.7, -1.8], [0.4, 0.4, 0.4])
    const brakeLight2 = createLightObject('redlight', [-0.7, 0.7, -1.82], [0.4, 0.4, 0.4])
    this.carBody.add( brakeLight1 )
    this.brakeLights.push(brakeLight1 )
    this.carBody.add( brakeLight2 )
    this.brakeLights.push(brakeLight2)

    this.reverseLights = []
    const reverseLight = createLightObject('whitelight', [0.6, 0.1, -2], [0.4, 0.4, 0.4])
    this.carBody.add( reverseLight )
    this.reverseLights.push(reverseLight)


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

  updateLights(brakeInput, isReverse){
    if(brakeInput > 0){
      this.brakeLights.forEach(b => b.visible = true)
    }
    else {
      this.brakeLights.forEach(b => b.visible = false)
    }

    if(isReverse){
      this.reverseLights.forEach(b => b.visible = true)
    }
    else {
      this.reverseLights.forEach(b => b.visible = false)
    }
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

/**
 *
 * @param name
 * @param {Array} pos
 * @param {Array} scale
 * @returns
 */
function createLightObject(name, pos=[0,0,0], scale=[1,1,1]){
  const texture = new THREE.TextureLoader().load( 'sprites/effects/'+name+'.png' )
  texture.minFilter = THREE.NearestMipmapNearestFilter
  texture.magFilter = THREE.NearestFilter
  const material = new THREE.SpriteMaterial( { map: texture } )
  const light = new THREE.Sprite( material )
  light.position.set(pos[0], pos[1], pos[2])
  light.scale.set(scale[0], scale[1], scale[2])
  light.visible = false
  return light
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





