import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'



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
  // const car = cars[index]
  console.log('create Car', car)
  // MODELS
  let carObject
  let carBody
  let wheelObjects = []
  let wheelModel
  let carModelName = car.props.model
  let wheelModelName = car.props.modelWheel
  
  let promiseObject = loadModel(wheelModelName)
  .catch((e) => {
    return loadModel('wheel')
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

    console.log('loaded model', gltf)

    carObject = gltf.scene ? gltf.scene : gltf
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
        let carWheel = cloneWheel(wheelModel, a, false)
        carObject.add(carWheel)
        wheelObjects.push(carWheel)
      }

      if ( a instanceof THREE.Mesh ) {
        console.log('set cast shadow')
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

    console.log("car created : ", carBody, car.id)

    return carObject
  })

  function animate(dt){
    if(!carObject) return

    let {speed, acceleration} = car.state
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



function loadDefaultCarModel(car){
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

async function loadDefaultCarModelProc(car){
  // const glb = await loadModel('_defaultcar')
  // const carObject = glb.scene
  // console.log('MODEL PROC : ',carObject)
  // return glb
  const {length, height} = car.props
  const geometry = new THREE.BufferGeometry()
  const indices = []
  const vertices = []
  const normals = []
  const colors = []

  const mainFrame = createMainFrame(length, height)
  vertices.push(...mainFrame.vertices.reduce((arr, v) => arr.concat(...v), []))
  indices.push(...mainFrame.faces)
  
  geometry.setIndex( indices );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  geometry.computeVertexNormals()

  let material = new THREE.MeshBasicMaterial({ color: 0xaa3377, vertexColors: false })
  let mesh = new THREE.Mesh(geometry, material)
  let group = new THREE.Group()
  group.add(mesh)
  console.log('MODEL PROC : ',group)
  return group
}


/**
 * 
 * Procedural model
 * 
 */

function createMainFrame(length, height){
  const halfLength = length/2 /1000
  const halfHeight = height/2 /1000
  const frameHeight = height/1000
  const trunkSize = halfLength/2
  const hoodSize = halfLength/2


  /**
   * 
   *       0----1
   *     / |   / \
   *    2--3--4--5--6
   *    |     |     |
   *    7     8     9
   * 
   */
  const botMid = [0,0,0]
  const botRear = [-halfLength,0,0]
  const botFront = [halfLength,0,0]

  const midRear  = [-halfLength          , halfHeight,0]
  const midTrunk = [-halfLength+trunkSize, halfHeight,0]
  const midMid   = [0                    , halfHeight,0]
  const midHood  = [halfLength-hoodSize  , halfHeight,0]
  const midFront = [halfLength           , halfHeight,0]

  const topFront = [0,frameHeight, 0] 
  const topRear = [-halfLength, frameHeight, 0]

  return {
    vertices : [topRear, topFront, midRear, midTrunk, midMid, midHood, midFront, botRear, botMid, botFront],
    faces : [0,2,3, 0,3,1, 1,3,4, 1,4,5],
  }
}