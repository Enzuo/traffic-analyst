import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'


/**
 * 
 * @param {*} car 
 * @param {number=} positionX
 * @param {string=} color 
 * @returns {import('./sceneGraph').AnimatedObject}
 */
export function createCarObject(car, positionX = 0, color){
  // const car = cars[index]
  console.log('create Car', car)
  // MODELS
  let carObject
  let carBody
  let wheelObjects = []
  let wheel
  let carModel = car.props.model
  let wheelModel = car.props.modelWheel
  let object = loadModel(wheelModel)
  .catch((e) => {
    return loadModel('wheel')
  })
  .then((wheelScene) => {
    wheel = wheelScene.scene.children[0]
    // wheel.material = clayMaterial.clone()
    wheel.material.color = new THREE.Color(0x333333)
  })
  .catch((e) => {
    console.error(e)
  })
  .then(() => {
    return loadModel(carModel)
  }).catch((e) => {
    return defaultCarModel(car)
  }).then((gltf) => {

    console.log('loaded model', gltf)

    carObject = gltf.scene
    // carObject.castShadow = true
    // scene.add( carObject )

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
        let carWheel = cloneWheel(wheel, a)
        carObject.add(carWheel)
        wheelObjects.push(carWheel)
      }

      if ( a instanceof THREE.Mesh ) {
        console.log('set cast shadow')
        a.castShadow = true
        a.receiveShadow = false
        // a.material.color = new THREE.Color(color)
        const texture = a.material.map;
        const newTexture = changeTextureColor(texture, color)
        a.material.map = newTexture

        // a.material.normalMap = clayMaterial.normalMap;
      }


      // Every thing other than wheel
      if(a.name.indexOf('Wheel') < 0){
        // let colorCode = ...color
        // a.material = clayMaterial.clone()
        // console.log(a)
        if(a && a.material){
          // a.material.color = new THREE.Color(color)
        }
      }

      // body
      if(a.name.indexOf('Body') >= 0){
        carBody = a
      }


    })

    miscObjects.forEach((m) => {
      carObject.remove(m.obj)
      const miscName = new RegExp(m.name, 'i')
      if(car.props.modelMisc && miscName.test(car.props.modelMisc)){
        let isWheel = m.name.indexOf('Wheel') >= 0
        if(isWheel){
          carBody.add(cloneWheel(wheel, m.obj))
          return 
        }
        carBody.add(m.obj)
      }
    })

    console.log("car created : ", carBody, car.id)

    return carObject
  })

  function animate(dt){
    if(!carObject) return
    // const car = cars[index]
    
    let {speed, acceleration} = car.state
    // console.log(dt, speed, carObject.position.z)
    let {wheelDiameter} = car.props
    let wheelTurnsPerS = getWheelTurns(speed, wheelDiameter)
    let wheelTurnOverDt = wheelTurnsPerS * (dt/1000) * Math.PI * 2
    let maxRotationSpeed = 0.25 // avoid rolling backward effect

    for(let i=0; i<wheelObjects.length; i++){
      let wheel = wheelObjects[i]
      wheel.rotation.x += Math.min(maxRotationSpeed,wheelTurnOverDt)
    }
    
    carObject.position.z += speed * dt / 1000

    // Add body tilt
    let tilt = (acceleration / 4) * (Math.PI/180)
    carBody.rotation.x = -tilt
  }

  // ThreeAnimation.subscribeAnimation(animate)

  return { animate , object}
}

function cloneWheel(wheel, empty){
  let carWheel = wheel.clone()
  carWheel.position.copy(empty.position)
  carWheel.rotation.copy(empty.rotation)

  if(!!empty.name.match(/R$/g)){
    carWheel.scale.x *= -1
  }
  return carWheel
}



function defaultCarModel(car){
  return loadModel('_defaultHatchback').then((glb) => {
    let carObject = glb.scene
    let wheelDiameter = car.props.wheelDiameter || 63
    let length = car.props.length || 4000
    let width = car.props.width || 1700
    let height = (car.props.height - (wheelDiameter * 5)) || 1500
    carObject.traverse((a) => {
      if(a.name.indexOf('Wheel') === 0){
        a.position.x *= width  / 1000
        a.position.z *= length  / 1000
      }
      if(a.name.indexOf('Body') === 0){
        a.scale.x = width  / 1000
        a.scale.y = height  / 1000
        a.scale.z = length  / 1000
      }
    })
    return glb
  })
}

