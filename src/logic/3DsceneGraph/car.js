import * as THREE from 'three'
import { getWheelTurns } from '@/logic/carLogic/physics'
import {loadModel} from './loader'
import {changeTextureColor} from './texture'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'




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
  const {length, height, width, wheelDiameter} = car.props
  const archSize = parseFloat(wheelDiameter) + 5
  const geometry = new THREE.BufferGeometry()
  const indices = []
  // const vertices = []
  const normals = []
  const colors = []
  const halfWidth = width/2 / 1000

  const vertices = []
  const viFrame = addMainFrame(vertices, [0,0,halfWidth],length, height)
  const viWheelArchRear = addWheelArch(vertices, [-1,0,halfWidth], archSize)
  const viWheelArchFront = addWheelArch(vertices, [1,0,halfWidth], archSize)
  const viFrame2 = addMainFrame(vertices, [0,0,-halfWidth],length, height)
  const viWheelArchRear2 = addWheelArch(vertices, [-1,0,-halfWidth], archSize)
  const viWheelArchFront2 = addWheelArch(vertices, [1,0,-halfWidth], archSize)


  const faces = Array().concat(
    createFacesForFrame(viFrame), 
    createFacesForFrame(viFrame2), 
    createFacesForWheelArch(viWheelArchFront, [8,4,5,6,9]),
    createFacesForWheelArch(viWheelArchRear, [7,2,3,4,8]),
    createFacesForWheelArch(viWheelArchFront2, [
      viFrame2[8],
      viFrame2[4],
      viFrame2[5],
      viFrame2[6],
      viFrame2[9]
    ]),
    createFacesForWheelArch(viWheelArchRear2, [
      viFrame2[7],
      viFrame2[2],
      viFrame2[3],
      viFrame2[4],
      viFrame2[8]
    ]),
    createFacesBetweenFrames(viFrame, viFrame2)
  )
  console.log("vertices Array", vertices, faces)
  const verticesBuffer = vertices.reduce((arr, v) => arr.concat(...v), [])
  
  geometry.setIndex( faces );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( verticesBuffer, 3 ) );
  // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  geometry.rotateY(-Math.PI/2)
  geometry.computeVertexNormals()

  let material = new THREE.MeshBasicMaterial({ color: 0xaa3377, vertexColors: false })
  let mesh = new THREE.Mesh(geometry, material)
  let group = new THREE.Group()

  const helper = new VertexNormalsHelper( mesh, 1, 0xff0000 )
  group.add(mesh)
  group.add(helper)
  console.log('MODEL PROC : ',group)
  return group
}


/**
 * 
 * Procedural model
 * 
 */

function addMainFrame(vertices, position, length, height){
  const halfLength = length/2 /1000
  const halfHeight = height/2 /1000
  const frameHeight = height/1000
  const trunkSize = halfLength/2
  const hoodSize = halfLength/2


  /**
   * 
   *       0----1
   *     / | \ / \
   *    2--3--4--5--6
   *    |     |     |
   *    7     8     9
   * 
   */
  const verticesFrame = [
    // TOP
    [-halfLength          , frameHeight, position[2]],
    [0                    , frameHeight, position[2]] ,
    
    // MID SECTION
    [-halfLength          , halfHeight, position[2]],
    [-halfLength+trunkSize, halfHeight, position[2]],
    [0                    , halfHeight, position[2]],
    [halfLength-hoodSize  , halfHeight, position[2]],
    [halfLength           , halfHeight, position[2]],
    
    // BOTTOM
    [-halfLength          , 0         , position[2]],
    [0                    , 0         , position[2]],
    [halfLength           , 0         , position[2]],
  ]

  const verticesIndex = []
  verticesFrame.forEach(v => {
    let i = vertices.push(v)
    verticesIndex.push(i-1)
  });

  return verticesIndex
}

function createFacesForFrame(vi){
  return [
    vi[0],vi[2],vi[3], 
    vi[0],vi[3],vi[1], 
    vi[1],vi[3],vi[4], 
    vi[1],vi[4],vi[5],
  ]
}

function createFacesBetweenFrames(viF1, viF2){
  return [
    viF1[7], viF1[2], viF2[7],
    viF2[7], viF1[2], viF2[2],

    viF1[2], viF1[0], viF2[2],
    viF2[2], viF1[0], viF2[0],

    viF1[0], viF1[1], viF2[0],
    viF2[0], viF1[1], viF2[1],

    viF1[1], viF1[5], viF2[1],
    viF2[1], viF1[5], viF2[5],

    viF1[5], viF1[6], viF2[5],
    viF2[5], viF1[6], viF2[6],

    viF1[6], viF1[9], viF2[6],
    viF2[6], viF1[9], viF2[9],
  ]
}

/**
 *       
 *     2 3 4
 *   1       5 
 *  0         6
 * 
 */
function addWheelArch(vertices, position, size){
  const VERTICESNB = 6
  const archVerticesIndex = []
  for(let i=0; i<=VERTICESNB; i++){
    let x = -Math.cos(i * Math.PI/VERTICESNB) * size/100 + position[0]
    let z = Math.sin(i * Math.PI/VERTICESNB) * size/100 + position[1]
    let y = position[2]

    archVerticesIndex.push(vertices.push([x, z, y])-1)
  }

  return archVerticesIndex
}

function createFacesForWheelArch(viArch, viFrame){
  const faces = [
    viFrame[0], viArch[0], viArch[1],
    viFrame[0], viArch[1], viFrame[1],
    viFrame[1], viArch[1], viArch[2],
    viFrame[1], viArch[2], viFrame[2],
    viFrame[2], viArch[2], viArch[3],

    viFrame[2], viArch[3], viArch[4],
    viFrame[2], viArch[4], viFrame[3],
    viFrame[3], viArch[4], viArch[5],
    viFrame[3], viArch[5], viFrame[4],
    viFrame[4], viArch[5], viArch[6],
  ]
  return faces
}