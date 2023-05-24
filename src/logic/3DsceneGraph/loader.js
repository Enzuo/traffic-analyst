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
  // MODELS
  // let carObject
  // let body
  // let propeller
  // let wheels = []
  // let wheelModel
  // let carModelName = car.props.model
  // let wheelModelName = car.props.modelWheel

  // let promiseObject =
  // loadWheelModel(car)
  // .then((model) => {
  //   wheelModel = model
  // })
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
      // let wheelIndex = matchWheel[1]
      // let scale = 1
      // if(car.props.wheelScale){
      //   scale = car.props.wheelScale[wheelIndex-1] || 1
      // }
      // let wheel = new Wheel(wheelModel, a, scale, wheelIndex)
      // carObject.add(wheel.object)
      // wheels.push(wheel)
    }

    // if ( a instanceof THREE.Mesh ) {
    //   a.castShadow = true
    //   a.receiveShadow = false
    //   const texture = a.material.map;
    //   const newTexture = changeTextureColor(texture, color)
    //   a.material.map = newTexture
    // }

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

  // miscObjects.forEach((m) => {
  //   carObject.remove(m.obj)
  //   const miscName = new RegExp(m.name, 'i')
  //   if(car.props.modelMisc && miscName.test(car.props.modelMisc)){
  //     let isWheel = m.name.indexOf('Wheel') >= 0
  //     if(isWheel){
  //       body.add(cloneWheel(wheelModel, m.obj))
  //       return
  //     }
  //     body.add(m.obj)
  //   }
  // })

  console.log('MISC', misc)

  return {group: scene, body, wheels, misc, propellers}
}



export async function loadWheelModel (wheelName) {
  // const wheelName = car.props.modelWheel

  return loadModel(wheelName)
  .catch(async (e) => {
    const wheelScene = await loadModel('wheel')

    // scale default wheel
    // const defaultWheelDiameter = 63
    // const wheelDiameter = car.props.wheelDiameter
    // if(wheelDiameter){
    //   let r = wheelDiameter/defaultWheelDiameter
    //   wheelScene.scene.children[0].scale.set(r, r, r)
    // }

    return wheelScene
  })
  .then((wheelScene) => {
    const wheelModel = wheelScene.scene.children[0]
    wheelModel.material.color = new THREE.Color(0x333333)
    return wheelModel
  })
}
