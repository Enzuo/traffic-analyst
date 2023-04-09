import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { createCarObject } from './car'

CameraControls.install( { THREE: THREE } )


function createScene () {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true; // much better colors (https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js)
  renderer.outputEncoding = THREE.sRGBEncoding; 
  renderer.useLegacyLights = false;
  renderer.setClearColor( 0xf8d0a3 );
  renderer.setSize( 300, 300 );

  renderer.toneMappingExposure = 0.1;


  // SHADOWS
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  return {element : renderer.domElement, scene, renderer}
}

function createLights (scene) {
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

function createCamera (renderer) {
    // CAMERA
    const ratio = 1 // window.innerWidth / window.innerHeight
    const camera = new THREE.PerspectiveCamera( 75, ratio, 0.1, 1000 );
    camera.position.z = 10;
  
    const cameraControls = new CameraControls( camera, renderer.domElement );
    cameraControls.dollySpeed = 0.1

    return {camera, cameraControls}
}


/***
 * 
            _   _ _____ __  __       _______ _____ ____  _   _ 
     /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | |
    /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| |
   / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` |
  / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  |
 /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_|
                                                              
                                                              
 */

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
function createAnimation (camera, scene, renderer, cameraControls) {
  const clock = new THREE.Clock()

  /**
   * @type {Array.<AnimatedObject>}
   */
  const animatedObjects = []
  const animateFunctions = []

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

    for(let i=0; i<animateFunctions.length; i++){
      animateFunctions[i](delta)
    }

    for(let i=0; i<animatedObjects.length; i++){
      animatedObjects[i].animate(delta)
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

  function addAnimateFunction(fn) {
    animateFunctions.push(fn)
  }

  return {start, stop, addAnimatedObject, addAnimateFunction}
}

/***
 * 
 * 
 * 
 *              CLASS ANIMATION
 * 
 * 
 * 
 * 
 */

class Animation {
  constructor (scene, camera, renderer, cameraControls) {
    Object.assign(this, { scene,camera, renderer, cameraControls })
    this.clock = new THREE.Clock()
  }

  start() {
    this.animationLoop()
  }

  stop() {
    cancelAnimationFrame(this.animationFrame)
  }

  animationLoop() {
    this.animationFrame = requestAnimationFrame( this.animationLoop.bind(this) );
    const delta = this.clock.getDelta() * 1000 // delta ms
    this.renderer.render(this.scene, this.camera );
    this.animate()
    this.cameraControls.update( delta );
  }

  animate() {

  }


}

class AnimationRotation extends Animation {
  constructor (scene, camera, renderer, CameraControls) {
    super(scene, camera, renderer, CameraControls)

    this.isChangingCar = true
    this.removeAnimation = Promise.resolve()
    this.currentRotation = 0
  }


  setCar(carObject) {
    this.removeAnimation.then(() => {
      this.scene.add(carObject)
      this.carObject = carObject

      setTimeoutPromise(() => {
        this.isChangingCar = false
      }, 150)
    })
  }

  removeCar() {
    this.isChangingCar = true
    let carToRemove = this.carObject
    this.removeAnimation = setTimeoutPromise(() => {
      return carToRemove
    }, 150)
    return this.removeAnimation
  }

  animate() {
    if(this.carObject) {
      if(this.isChangingCar){
        this.carObject.rotation.y += 0.5
      }
      else {
        this.currentRotation += 0.004
        this.carObject.rotation.y = this.currentRotation
      }
    }
  }
}

function setTimeoutPromise(fn, delay) {
  return new Promise(function(resolve) {
      setTimeout(() => {
        let result = fn()
        resolve(result)
      }, delay);
  });
}

/***
 * 
   _____  _____ ______ _   _ ______ _____ _____            _____  _    _ 
  / ____|/ ____|  ____| \ | |  ____/ ____|  __ \     /\   |  __ \| |  | |
 | (___ | |    | |__  |  \| | |__ | |  __| |__) |   /  \  | |__) | |__| |
  \___ \| |    |  __| | . ` |  __|| | |_ |  _  /   / /\ \ |  ___/|  __  |
  ____) | |____| |____| |\  | |___| |__| | | \ \  / ____ \| |    | |  | |
 |_____/ \_____|______|_| \_|______\_____|_|  \_\/_/    \_\_|    |_|  |_|
                                                                         
                                                                         
 */

export function SingleCarSceneGraph(car) {
  const {element, scene, renderer} = createScene()
  const lights = createLights(scene)
  const {camera, cameraControls} = createCamera(renderer) 
  const animation = new AnimationRotation(scene, camera, renderer, cameraControls)

  createEnvMap(scene, renderer)
  createGround(scene)

  animation.start()

  // --------


  createCarAndAnimateIt(car)

  function updateData(car){
    animation.removeCar().then((obj) => {
      scene.remove(obj)
    })
    createCarAndAnimateIt(car)
  }

  function createCarAndAnimateIt(car) {
    const carObject = createCarObject(car)
    carObject.object.then((obj) => {
      animation.setCar(obj)
    })
  }



  return {element, updateData}
}

/**
 * 
 * @param {*} cars 
 * @param {*} simulation 
 * @param {*} colors 
 * @returns 
 */

export default function SceneGraph (cars, simulation, colors) {

  const {element, scene, renderer} = createScene()
  const lights = createLights(scene)
  const {camera, cameraControls} = createCamera(renderer) 

  const animation = createAnimation(camera, scene, renderer, cameraControls)








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
    const distanceBetweenCar = 3
    const position = index*distanceBetweenCar - ((cars.length-1) * distanceBetweenCar/2)
    const carObject = createCarObject(scene, car, position, colors[index])
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








