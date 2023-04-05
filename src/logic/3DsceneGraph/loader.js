import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
// createRoad
// load materials
let clayMaterial
export const loadMaterials = () => new Promise ((resolve, reject) => {
  loader.load('/models/clay.glb', function (gltf) {
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

    loader.load('/3dmodels/' + filePath + '.glb', function(glb) {
      console.log(glb)
      resolve(glb)
    }, (progress) => {
      console.log('progress', progress)
    }, function(e) {
      reject(e)
    })
  })
} 
