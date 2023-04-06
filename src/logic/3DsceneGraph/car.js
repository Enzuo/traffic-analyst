import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'


/**
 * 
 * @param {*} scene 
 * @param {*} car 
 * @param {*} index 
 * @param {*} totalNumbers 
 * @param {*} color 
 * @returns {import('./sceneGraph').AnimatedObject}
 */
export function createCarObject(scene, car, index, totalNumbers, color){
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
    scene.add( carObject )

    let wheelDiameter = car.props.wheelDiameter || 63

    // Initial position
    const distanceBetweenCar = 3
    carObject.position.x += index*distanceBetweenCar - ((totalNumbers-1) * distanceBetweenCar/2)
    carObject.position.y += wheelDiameter/250

    carObject.traverse((a) => {
      // Wheels
      if(a.name.indexOf('Wheel') === 0){
        let carWheel = wheel.clone()
        carWheel.position.copy(a.position)

        // // inverse main scene scale if needed
        // wheel.scale.x = 1/carObject.scale.x
        // wheel.scale.y = 1/carObject.scale.y
        // wheel.scale.z = 1/carObject.scale.z

        if(!!a.name.match(/R$/g)){
          console.log('right wheel', carWheel)
          carWheel.scale.x *= -1
        }

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

