import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'
import { loadDefaultCarModelProc } from './proceduralCar'




/**
 * @typedef {import('./sceneGraph').AnimatedObject} AnimatedObject
 *
 */

/**
 *
 * @param {*} car
 * @param {number=} positionX
 * @param {string=} color
 * @returns {Promise<AnimatedObject>}
 */
export function createCarObject(car, positionX = 0, color){
  // MODELS
  let carObject
  let carBody
  let propeller
  let wheelObjects = []
  let wheelModel
  let carModelName = car.props.model
  let wheelModelName = car.props.modelWheel

  let promiseObject = loadModel(wheelModelName)
  .catch(async (e) => {
    const wheelScene = await loadModel('wheel')

    // scale default wheel
    const defaultWheelDiameter = 63
    const wheelDiameter = car.props.wheelDiameter
    let r = wheelDiameter/defaultWheelDiameter
    wheelScene.scene.children[0].scale.set(r, r, r)

    return wheelScene
  })
  .then((wheelScene) => {
    wheelModel = wheelScene.scene.children[0]
    wheelModel.material.color = new THREE.Color(0x333333)
  })
  .catch((e) => {
    console.error(e)
  })
  .then(() => {
    return loadModel(carModelName)
  }).catch(() => {
    return loadDefaultCarModelProc(car)
  }).then((gltf) => {
    carObject = gltf.scene ? gltf.scene : gltf

    let wheelDiameter = car.props.wheelDiameter || 63

    // Initial position
    carObject.position.x = positionX
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
      if(a.name.indexOf('Wheel') >= 0){
        let carWheel = cloneWheel(wheelModel, a, false)
        carObject.add(carWheel)
        wheelObjects.push(carWheel)
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
        carBody = a
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
          carBody.add(cloneWheel(wheelModel, m.obj))
          return
        }
        carBody.add(m.obj)
      }
    })

    return carObject
  })

  function animate(dt){
    if(!carObject) return

    const {speed, acceleration} = car.state
    let {wheelDiameter} = car.props
    let wheelTurnsPerS = getWheelTurns(speed, wheelDiameter)
    let wheelTurnOverDt = wheelTurnsPerS * (dt/1000) * Math.PI * 2
    let maxRotationSpeed = 0.25 // avoid rolling backward effect

    for(let i=0; i<wheelObjects.length; i++){
      let wheel = wheelObjects[i]
      wheel.rotation.x += Math.min(maxRotationSpeed, wheelTurnOverDt)
    }

    carObject.position.z += speed * dt / 1000

    // Add body tilt
    let tilt = (acceleration / 4) * (Math.PI/180)
    carBody.rotation.x = -tilt

    // Turn propeller
    if (propeller) {
      const {engineRpm} = car.state
      let propellerTurnOverDt = engineRpm / 60 * (dt/1000) * Math.PI * 2
      // TODO rotate in object own rotation matrix
      propeller.rotation.z +=  Math.min(maxRotationSpeed, propellerTurnOverDt)
    }
  }

  return promiseObject.then((object) => {return { animate , object}})
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
