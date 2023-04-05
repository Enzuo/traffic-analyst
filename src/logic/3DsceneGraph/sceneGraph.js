import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { createCar } from './car'

CameraControls.install( { THREE: THREE } )


function setupScene () {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true; // much better colors (https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js)
  renderer.outputEncoding = THREE.sRGBEncoding; 
  renderer.useLegacyLights = false;
  renderer.setClearColor( 0xf8d0a3 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.toneMappingExposure = 0.1;


  // SHADOWS
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;



  return {element : renderer.domElement, scene, renderer}
}

function setupLights (scene) {
  // LIGHTS
  // let ambLight = new THREE.AmbientLight( 0xffffff, 0.3 ); // soft white light
  // scene.add( ambLight );

  let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  const targetObject = new THREE.Object3D();
  targetObject.position.set(0, 0, 0)
  directionalLight.position.set(0, 5, 0)
  directionalLight.target = targetObject;
  directionalLight.castShadow = true;
  scene.add(targetObject);
  scene.add( directionalLight );

    // let ptLight = new THREE.PointLight( 0xffffff, 100, 0 );
  // ptLight.position.set( -300, 300, 300 );
  // scene.add( ptLight );



  directionalLight.shadow.mapSize.width = 512; // default
  directionalLight.shadow.mapSize.height = 512; // default
  directionalLight.shadow.camera.near = 0.5; // default
  directionalLight.shadow.camera.far = 500; // default


  const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
  scene.add( helper );

}

function setupCamera (renderer) {
    // CAMERA
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 10;
  
    const cameraControls = new CameraControls( camera, renderer.domElement );
    cameraControls.dollySpeed = 0.1

    return {camera, cameraControls}
}

/**
 * AnimatedObject
 * @typedef {Object} AnimatedObject
 * @property {(delta) => void} animate - The animation function of that object
 * @property {Promise<object>=} object
 */

/**
 * Animation factory
 * @param {*} camera 
 * @param {*} scene 
 * @param {*} renderer 
 * @returns 
 */
function createAnimation (camera, scene, renderer, cameraControls, simulation) {
  const clock = new THREE.Clock()

  /**
   * @type {Array.<AnimatedObject>}
   */
  const animatedObjects = []

  let animationFrame
  function start() {
    animationLoop()
  }

  function stop() {
    cancelAnimationFrame(animationFrame)
  }

  function animationLoop() {
    animationFrame = requestAnimationFrame( animationLoop );
    const delta = clock.getDelta() * 1000 // delta ms

    if(simulation.isPlaying){
      for(let i=0; i<animatedObjects.length; i++){
        animatedObjects[i].animate(delta)
      }
    }

    // controls.update();
    updateCameraDistance(camera, cameraControls, carObjects)
    const hasControlsUpdated = cameraControls.update( delta );


    renderer.render( scene, camera );
  }

  /**
   * Adds an animated object to the list of objects to be animated.
   * @param {AnimatedObject} obj - The object to be added to the list.
   */
  function addAnimatedObject(obj) {
    animatedObjects.push(obj)
  }

  return {start, stop, addAnimatedObject}
}

export default function SceneGraph (cars, simulation) {

  const {element, scene, renderer} = setupScene()
  const lights = setupLights(scene)
  const {camera, cameraControls} = setupCamera(renderer) 

  const animation = createAnimation(camera, scene, renderer, cameraControls, simulation)








  // ANIMATION
  animation.start()

  /**
   * 
   * @param {Function} fn 
   */
  // function subscribeAnimation(fn){
  //   animateFns.push(fn)
  // }

  createEnvMap(scene, renderer)

  // CUBE
  const animatedCube = createCube(scene)
  animation.addAnimatedObject(animatedCube)

  // GROUND
  createGround(scene)

  // CARS
  cars.forEach((car, index) => {
    const carObject = createCar(scene, car, index, cars.length)
    carObject.object.then((object) => {
      carObjects.push(object)
    })
    animation.addAnimatedObject(carObject)
  })


  return element
}

let carObjects = []

function updateCameraDistance(camera, cameraControls, cars){
  let positions = []
  for(let i=0; i<cars.length; i++){
    positions.push(cars[i].position.z)
  }
  let carMaxX = Math.max(...positions)
  let carMinX = Math.min(...positions)
  const distanceBetweenCar = 3
  let distanceMaxBetweenCar = Math.max(carMaxX - carMinX, (cars.length) * distanceBetweenCar)
  
  let distanceCameraMin = distanceMaxBetweenCar / 2
  let cameraPosX = (carMaxX + carMinX) / 2
  cameraPosX = cameraPosX ? cameraPosX : 0

  cameraControls.moveTo(0,0,cameraPosX)
  if(cameraControls.distance < distanceCameraMin){
    cameraControls.dollyTo(distanceCameraMin, false)
    cameraControls.minDistance = distanceCameraMin
  }
}

/**
 * 
 * @param {THREE.Scene} scene 
 * @returns AnimatedObject
 */
function createCube (scene) {
  // let {scene} = ThreeAnimation
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  cube.position.y = 2
  cube.castShadow = true
  scene.add( cube );
  cube.position.z = -3;
  cube.position.x = -3

  function animate(dt){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  return { animate }
}

function createGround (scene) {
  // const groundGeometry = new THREE.PlaneBufferGeometry(10000, 10000)
  // const groundMaterial = new THREE.ShadowMaterial();
  // groundMaterial.opacity = 0.5; // set the opacity of the shadow material
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.position.y = -1; // position the plane at y = -1 so that it is below other objects in the scene
  ground.rotation.x = -Math.PI / 2; // rotate the plane to lie flat on the x-z plane
  ground.receiveShadow = true; // enable the plane to receive shadows
  scene.add(ground);
}



function createEnvMap(scene, renderer){
  // ENV MAP
  // const textureLoader = new THREE.TextureLoader();
  // let textureEquirec = textureLoader.load( '/models/env.jpeg' );
  // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  // textureEquirec.encoding = THREE.sRGBEncoding;

  // scene.environment = textureEquirec

  // let background = new THREE.Color( 0xaaaaaa );
  // scene.background = background

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








