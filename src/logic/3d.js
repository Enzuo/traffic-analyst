import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { getWheelTurns } from './carphysics/physics'
import { xlink_attr } from 'svelte/internal'

CameraControls.install( { THREE: THREE } )


export function createThreeAnimation ( element ) {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer();
  // renderer.physicallyCorrectLights = true;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize( window.innerWidth, window.innerHeight );
  element.appendChild( renderer.domElement );

  // LIGHTS
  let ambLight = new THREE.AmbientLight( 0xffffff, 0.3 ); // soft white light
  scene.add( ambLight );

  let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  const targetObject = new THREE.Object3D();
  targetObject.position.set(300, -100, -200)
  directionalLight.target = targetObject;
  directionalLight.castShadow = true;
  scene.add(targetObject);
  scene.add( directionalLight );

  // let ptLight = new THREE.PointLight( 0xffffff, 100, 0 );
  // ptLight.position.set( -300, 300, 300 );
  // scene.add( ptLight );

  // CLOCK
  const clock = new THREE.Clock();


  // CAMERA
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  const cameraControls = new CameraControls( camera, renderer.domElement );
  cameraControls.dollySpeed = 0.1


  // ANIMATION
  let animateFns = []
  function animate() {
    requestAnimationFrame( animate );

    for(let i=0; i<animateFns.length; i++){
      animateFns[i]()
    }

    // controls.update();
    const delta = clock.getDelta();
    const hasControlsUpdated = cameraControls.update( delta );
    updateCameraDistance(camera, cameraControls, carObjects)


    renderer.render( scene, camera );
  }
  animate()

  /**
   * 
   * @param {Function} fn 
   */
  function subscribeAnimation(fn){
    animateFns.push(fn)
  }

  // createEnvMap(scene, renderer)

  // CUBE
  createCube(scene, subscribeAnimation)


  return {scene, renderer, subscribeAnimation}
}

let carObjects = []

function updateCameraDistance(camera, cameraControls, cars){
  let positions = []
  for(let i=0; i<cars.length; i++){
    positions.push(cars[i].position.x)
  }
  let carMaxX = Math.max(...positions)
  let carMinX = Math.min(...positions)
  const distanceBetweenCar = 3
  let distanceMaxBetweenCar = Math.max(carMaxX - carMinX, (cars.length) * distanceBetweenCar)
  
  let distanceCameraMin = distanceMaxBetweenCar / 2
  let cameraPosX = (carMaxX + carMinX) / 2
  cameraPosX = cameraPosX ? cameraPosX : 0

  cameraControls.moveTo(cameraPosX,0,0)
  if(cameraControls.distance < distanceCameraMin){
    cameraControls.dollyTo(distanceCameraMin, false)
    cameraControls.minDistance = distanceCameraMin
  }
}


function createCube (scene, subscribeAnimation) {
  // let {scene} = ThreeAnimation
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.z = -5;

  function animate(){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  subscribeAnimation(animate)
}



function createEnvMap(scene, renderer){
  // ENV MAP
  const textureLoader = new THREE.TextureLoader();
  let textureEquirec = textureLoader.load( '/models/env.jpeg' );
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.encoding = THREE.sRGBEncoding;

  scene.environment = textureEquirec

  let background = new THREE.Color( 0xaaaaaa );
  scene.background = background

  // ENV MAP 2
  let pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();
  let path = '/models/env/venice_sunset_1k.hdr'
  new RGBELoader()
      .load( path, ( texture ) => {

        const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
        pmremGenerator.dispose();
        scene.environment = envMap
        scene.background = null // envMap
      })

}


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

export function createCar(ThreeAnimation, index, totalNumbers, color){
  let {scene} = ThreeAnimation
  // MODELS
  let carObject
  let wheelObjects = []
  loader.load( '/models/zoe.glb', function ( gltf ) {
    console.log(gltf)

    carObject = gltf.scene
    scene.add( carObject )

    carObjects.push(carObject)

    // Initial position
    const distanceBetweenCar = 3
    carObject.position.z += index*distanceBetweenCar - ((totalNumbers-1) * distanceBetweenCar/2)

    carObject.traverse((a) => {
      // Wheels
      if(a.name.indexOf('Wheel') === 0){
        wheelObjects.push(a)
      }

      if ( a instanceof THREE.Mesh ) {
        // a.material.normalMap = clayMaterial.normalMap;
      }


      //
      if(a.name.indexOf('Body') === 0){
        // let colorCode = ...color
        a.material = clayMaterial.clone()
        // console.log(a)
        a.material.color = new THREE.Color(color)
      }
    })
  })

  function update(dt, car){
    if(!carObject) return

    let {speed} = car.state
    let {wheelDiameter} = car.props
    let wheelTurnsPerS = getWheelTurns(speed, wheelDiameter)
    let wheelTurnOverDt = wheelTurnsPerS * (dt/1000) * Math.PI * 2
    let maxRotationSpeed = 0.25 // avoid rolling backward effect

    for(let i=0; i<wheelObjects.length; i++){
      let wheel = wheelObjects[i]
      wheel.rotation.y += Math.min(maxRotationSpeed,wheelTurnOverDt)
    }
    
    carObject.position.x -= speed * dt / 1000
  }

  // ThreeAnimation.subscribeAnimation(animate)

  return { update }
}



// function main(){
//   let ThreeAnimation = createThreeAnimation(document.body)
//   createCube(ThreeAnimation)
//   createCar(ThreeAnimation)
// }

// main()