import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { loadDefaultCarModelProc } from './proceduralCar'

const loader = new GLTFLoader()
// createRoad
// load materials
let clayMaterial
export const loadMaterials = () => new Promise ((resolve, reject) => {
  loader.load('models/clay.glb', function (gltf) {
    console.log('material', gltf)

    gltf.scene.traverse( function( object ) {
      if ( object.material ) {
        clayMaterial = object.material
        console.log(object.material)
        resolve()
      }
    });
  })
})

export function loadModel(filePath) {
  return new Promise((resolve, reject) => {
    if(!filePath) reject(Error('no file specified'))

    loader.load('3dmodels/' + filePath + '.glb', function(glb) {
      // console.log(glb)
      resolve(glb)
    }, (progress) => {
      // console.log('progress', progress)
    }, function(e) {
      reject(e)
    })
  })
}



//


export function loadCarModel(car) {
  return loadModel(car.model)
  .catch(() => loadDefaultCarModelProc(car))
  .then((gltf) => {
    const scene = gltf.scene ? gltf.scene : gltf
    return parseCarScene(scene)
  })
}

function parseCarScene(scene){
  let body
  let wheels = []
  let misc = []
  let propellers = []

  scene.traverse((a) => {

    // MISC
    const miscObj = a.name.match(/^misc(\w*)/i)
    if(miscObj){
      let isWheel = a.name.indexOf('Wheel') >= 0
      misc.push({obj: a, name: miscObj[1], isWheel})
      return
    }

    // WHEELS
    let matchWheel = a.name.match(/Wheel(\d+)/)
    if(matchWheel){
      let isRight = a.name.match(/R$/g) ? true : false
      wheels.push({obj : a, name : a.name, index : matchWheel[1], isRight})
      return
    }

    // body
    if(a.name.indexOf('Body') >= 0){
      body = a
      return
    }

    if(a.name.indexOf('Propeller') >= 0){
      propellers.push({obj : a, name : a.name})
      return
    }
  })

  return {group: scene, body, wheels, misc, propellers}
}



export async function loadWheelModel (wheelName) {
  return loadModel(wheelName)
  .catch(() => loadModel('wheel'))
  .then((wheelScene) => {
    const wheelModel = wheelScene.scene.children[0]
    wheelModel.material.color = new THREE.Color(0x333333)
    return wheelModel
  })
}
