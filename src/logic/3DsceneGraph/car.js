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



/**
 * 
 *  _____                   _             _                _     _ 
 * |  _  |___ ___ ___ ___ _| |_ _ ___ ___| |   _____ ___ _| |___| |
 * |   __|  _| . |  _| -_| . | | |  _| .'| |  |     | . | . | -_| |
 * |__|  |_| |___|___|___|___|___|_| |__,|_|  |_|_|_|___|___|___|_|                                                               
 * 
 */


async function loadDefaultCarModelProc(car){
  // const glb = await loadModel('_defaultcar')
  // const carObject = glb.scene
  // console.log('MODEL PROC : ',carObject)
  // return glb
  const {length, height, width, wheelbase, clearance, bodyType} = car.props
  const wheelDiameter = car.props.wheelDiameter * 10
  const archSize = (wheelDiameter + 50 )
  const MAX_wheelbase = length - archSize - 0.05

  const frameClearance = clearance || wheelDiameter/2
  const frameBottom = frameClearance - wheelDiameter/2
  const frameHeight = height - frameClearance
  const frameLength = length
  const frameWidth = width
  const frameWheelBase = Math.min(MAX_wheelbase, wheelbase)

  const halfWidth = width/2

  const vertices = []
  const viFrame = addMainFrame(vertices, [0,0,halfWidth], frameLength, frameHeight, frameBottom, bodyType)
  const viWRear = addWheelArch(vertices, [-frameWheelBase/2,0,halfWidth], archSize, frameBottom)
  const viWFront = addWheelArch(vertices, [frameWheelBase/2,0,halfWidth], archSize, frameBottom)
  const viFrame2 = addMainFrame(vertices, [0,0,-halfWidth], frameLength, frameHeight, frameBottom, bodyType)
  const viWRear2 = addWheelArch(vertices, [-frameWheelBase/2,0,-halfWidth], archSize, frameBottom)
  const viWFront2 = addWheelArch(vertices, [frameWheelBase/2,0,-halfWidth], archSize, frameBottom)


  const faces = Array().concat(
    createFacesForFrame(viFrame, false, bodyType), 
    createFacesForFrame(viFrame2, true, bodyType), 
    createFacesForWheelArch(viWFront, [8,4,5,6,9]),
    createFacesForWheelArch(viWRear, [7,2,3,4,8]),
    createFacesForWheelArch(viWFront2, [
      viFrame2[8],
      viFrame2[4],
      viFrame2[5],
      viFrame2[6],
      viFrame2[9]
    ], true),
    createFacesForWheelArch(viWRear2, [
      viFrame2[7],
      viFrame2[2],
      viFrame2[3],
      viFrame2[4],
      viFrame2[8]
    ], true),
    createFacesBetweenFrames(viFrame,viFrame2, viWRear,viWRear2, viWFront,viWFront2, bodyType)
  )
  console.log("vertices Array", vertices, faces)
  

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex( faces );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices.flat(), 3 ) );
  // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  geometry.rotateY(-Math.PI/2)
  geometry.computeVertexNormals()

  let material = new THREE.MeshBasicMaterial({ color: 0xaa3377, vertexColors: false })
  let mesh = new THREE.Mesh(geometry, material)
  let group = new THREE.Group()
  
  // wheels
  const wheelWidth = 80
  group.add(createWheelEmpty('Wheel1L', [frameWidth/2-wheelWidth,0,frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel2R', [-frameWidth/2+wheelWidth,0,frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel3L', [frameWidth/2-wheelWidth,0,-frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel4R', [-frameWidth/2+wheelWidth,0,-frameWheelBase/2]))

  const helper = new VertexNormalsHelper( mesh, 1, 0xff0000 )
  group.add(mesh)
  group.add(helper)
  console.log('MODEL PROC : ',group)
  return group
}


function createWheelEmpty(name, position){
  // convert mm to m
  position = position.map(p => p/1000)

  let wheel = new THREE.Object3D()
  wheel.position.set(position[0], position[1], position[2])
  wheel.name = name
  return wheel
}


function addMainFrame(vertices, position, length, height, bottom, type='hatchback'){
  // convert mm to m
  position = position.map(p => p/1000)
  length /= 1000
  height /= 1000
  bottom /= 1000

  // TODO use frameHeight
  const halfLength = length/2 
  const halfHeight = height*0.6
  const frameHeight = height
  const trunkSize = Math.min(1,halfLength/2)
  const hoodSize = Math.min(2,halfLength/2)

  // slanded roof
  let topY = Math.abs(position[2])
  topY = Math.max(topY*0.8, topY - 0.2)
  topY = topY * Math.sign(position[2])

  let topRear = halfLength
  let topFront = 0.3*halfLength
  if(type === 'hatchback'){
    topRear = Math.max(0.8*halfLength, halfLength-0.3)
  }
  if(type === 'bus'){
    topRear = Math.max(0.9*halfLength, halfLength-0.1)
    topFront = Math.max(0.9*halfLength, halfLength-0.1)
  }
  if(type === 'sedan'){
    topRear = Math.max(0.4*halfLength, halfLength-1.2)
  }

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
    [-topRear             , frameHeight, topY],
    [topFront             , frameHeight, topY] ,
    
    // MID SECTION
    [-halfLength          , halfHeight, position[2]],
    [-halfLength+trunkSize, halfHeight, position[2]],
    [0                    , halfHeight, position[2]],
    [halfLength-hoodSize  , halfHeight, position[2]],
    [halfLength           , halfHeight, position[2]],
    
    // BOTTOM
    [-halfLength          , bottom    , position[2]],
    [0                    , bottom    , position[2]],
    [halfLength           , bottom    , position[2]],
  ]

  const verticesIndex = []
  verticesFrame.forEach(v => {
    let i = vertices.push(v)
    verticesIndex.push(i-1)
  });

  return verticesIndex
}


function createFacesForFrame(vi, isInverted=false, type){
  const faces = [
    vi[0],vi[3],vi[1], 
    vi[1],vi[3],vi[4], 
    vi[1],vi[4],vi[5],
  ]
  let hasTrunk = type === 'sedan'
  if(!hasTrunk){
    faces.push(vi[0],vi[2],vi[3])
  }
  let hasHood = type !== 'bus'
  if(!hasHood){
    faces.push(vi[1],vi[5],vi[6])
  }
  if(isInverted){
    let invertedFaces = []
    for(var i=0; i<faces.length; i+=3){
      invertedFaces.push(faces[i], faces[i+2], faces[i+1])
    }
    return invertedFaces
  }
  return faces
}

function createFacesBetweenFrames(viF1, viF2, viWR1, viWR2, viWF1, viWF2, type){
  const faces = [
    viF1[7], viF1[2], viF2[7],
    viF2[7], viF1[2], viF2[2],

    viF1[0], viF1[1], viF2[0],
    viF2[0], viF1[1], viF2[1],

    viF1[6], viF1[9], viF2[6],
    viF2[6], viF1[9], viF2[9],

    // Bottom
    viWR1[0], viF1[7], viF2[7],
    viWR2[0], viWR1[0], viF2[7],

    viWR1[6], viWR2[6], viF1[8],
    viF1[8] , viWR2[6], viF2[8],

    viF1[8] , viF2[8], viWF1[0],
    viWF1[0], viF2[8], viWF2[0],

    viWF1[6], viWF2[6], viF1[9],
    viF1[9] , viWF2[6], viF2[9],
    // Arch
  ]

  const hasTrunk = type === 'sedan'
  // rear trunk
  if(hasTrunk){
    faces.push(
      viF1[2], viF1[3], viF2[2],
      viF1[3], viF2[3], viF2[2],
  
      viF1[3], viF1[0], viF2[3],
      viF1[0], viF2[0], viF2[3],
    )
  }
  else {
    // rear hatch
    faces.push(
      viF1[2], viF1[0], viF2[2],
      viF2[2], viF1[0], viF2[0],
    )
  }

  const hasHood = type !== 'bus'
  if(hasHood){
    faces.push(
      viF1[1], viF1[5], viF2[1],
      viF2[1], viF1[5], viF2[5],

      viF1[5], viF1[6], viF2[5],
      viF2[5], viF1[6], viF2[6],
    )
  }
  else {
    faces.push(
      viF1[1], viF1[6], viF2[1],
      viF2[1], viF1[6], viF2[6],
    )
  }

  return faces
}


/**
 *       
 *     2 3 4
 *   1       5 
 *  0         6
 * 
 */
function addWheelArch(vertices, position, size, bottom){
  // convert mm to m
  position = position.map(p => p/1000)
  size /= 1000
  bottom /= 1000

  const VERTICESNB = 6
  const archVerticesIndex = []
  for(let i=0; i<=VERTICESNB; i++){
    let x = -Math.cos(i * Math.PI/VERTICESNB) * size/2 + position[0]
    let z = Math.sin(i * Math.PI/VERTICESNB) * size/2 + position[1]
    let y = position[2]

    z = (i === 0 || i===VERTICESNB) ? bottom : Math.max(bottom, z)

    archVerticesIndex.push(vertices.push([x, z, y])-1)
  }

  return archVerticesIndex
}

function createFacesForWheelArch(viArch, viFrame, isInverted=false){
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

  if(isInverted){
    let invertedFaces = []
    for(var i=0; i<faces.length; i+=3){
      invertedFaces.push(faces[i], faces[i+2], faces[i+1])
    }
    return invertedFaces
  }

  return faces
}