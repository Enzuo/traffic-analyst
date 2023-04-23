import * as THREE from 'three'
import {loadModel} from './loader'




export function loadDefaultCarModel(car){
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

const BODY_TYPES = {
  HATCHBACK : {
    id : 1,
    hasTrunk : false,
    hasHood : true,
    regex:/hatchback/i,
  },
  BUS : {
    id : 2,
    hasTrunk : false,
    hasHood : false,
    regex:/bus/i,
  },
  MPV : { // van, monospace
    id : 3,
    hasTrunk : false,
    hasHood : false,
    regex:/van|monospace|mpv/i,
  },
  SEDAN : {
    id : 4,
    hasTrunk : true,
    hasHood : true,
    regex:/sedan/i,
  },
  FASTBACK : {
    id: 5,
    hasHood: true,
    hasTrunk: false,
    regex:/liftback|fastback/i,
  },
  BOX : {
    id: 6,
    hasHood: true,
    hasTrunk: false,
    regex:/box/i,

  }

}

/**
 *
 * @param {string} type
 */
 function getBodyType(type){
  if(!type){
    return BODY_TYPES.HATCHBACK
  }
  let t = Object.values(BODY_TYPES).find(t => t.regex.test(type))
  return t ? t : BODY_TYPES.HATCHBACK
}


export async function loadDefaultCarModelProc(car){

  const {length, height, width, wheelbase, clearance} = car.props
  const wheelDiameter = car.props.wheelDiameter * 10
  const archSize = (wheelDiameter + 100 )
  const MAX_wheelbase = length - archSize - 0.05

  const frameClearance = clearance || wheelDiameter/2
  const frameBottom = frameClearance - wheelDiameter/2
  const frameHeight = height - frameClearance
  const frameLength = length
  const frameWidth = width
  const frameWheelBase = Math.min(MAX_wheelbase, wheelbase)

  const halfWidth = width/2

  const bodyType = getBodyType(car.props.bodyType)

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


  let geometry = new THREE.BufferGeometry()
  geometry.setIndex( faces );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices.flat(), 3 ) );
  // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  geometry.rotateY(-Math.PI/2)
  geometry = geometry.toNonIndexed() // flat shading
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({ color: 0xaa3377, vertexColors: false })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'Body'
  const group = new THREE.Group()

  // wheels
  const wheelWidth = wheelDiameter/7
  group.add(createWheelEmpty('Wheel1L', [frameWidth/2-wheelWidth,0,frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel2R', [-frameWidth/2+wheelWidth,0,frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel3L', [frameWidth/2-wheelWidth,0,-frameWheelBase/2]))
  group.add(createWheelEmpty('Wheel4R', [-frameWidth/2+wheelWidth,0,-frameWheelBase/2]))

  group.add(mesh)
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


function addMainFrame(vertices, position, length, height, bottom, type){
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
  if(type === BODY_TYPES.HATCHBACK){
    topRear = Math.max(0.8*halfLength, halfLength-0.3)
  }
  if(type === BODY_TYPES.BUS){
    topRear = Math.max(0.9*halfLength, halfLength-0.1)
    topFront = Math.max(0.85*halfLength, halfLength-0.5)
  }
  if(type === BODY_TYPES.SEDAN){
    topRear = Math.max(0.4*halfLength, halfLength-1.2)
  }
  if(type === BODY_TYPES.FASTBACK){
    topRear = 0.4*halfLength
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

  if(!type.hasTrunk){
    faces.push(vi[0],vi[2],vi[3])
  }
  if(!type.hasHood){
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
  ]
  // Arch
  faces.push(...createFacesBetweenArchs(viWR1,viWR2))
  faces.push(...createFacesBetweenArchs(viWF1,viWF2))

  // rear trunk
  if(type.hasTrunk){
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

  if(type.hasHood){
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

function createFacesBetweenArchs(viArch1,viArch2){
  const faces = []
  for(var i=0; i<viArch1.length; i++){
    faces.push(
      viArch1[i+1],viArch1[i],viArch2[i],
      viArch1[i+1],viArch2[i],viArch2[i+1],
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