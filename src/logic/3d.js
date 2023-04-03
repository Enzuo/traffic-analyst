import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { getWheelTurns } from './carphysics/physics'

CameraControls.install( { THREE: THREE } )


export function createThreeAnimation ( element ) {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true; // much better colors (https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js)
  renderer.outputEncoding = THREE.sRGBEncoding; 
  renderer.useLegacyLights = false;
  renderer.setClearColor( 0xf8d0a3 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  element.appendChild( renderer.domElement );

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

  renderer.toneMappingExposure = 0.1;

  // let ptLight = new THREE.PointLight( 0xffffff, 100, 0 );
  // ptLight.position.set( -300, 300, 300 );
  // scene.add( ptLight );

  // SHADOWS
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  directionalLight.shadow.mapSize.width = 512; // default
  directionalLight.shadow.mapSize.height = 512; // default
  directionalLight.shadow.camera.near = 0.5; // default
  directionalLight.shadow.camera.far = 500; // default

  const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
  scene.add( helper );

  // CLOCK
  const clock = new THREE.Clock();


  // CAMERA
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  const cameraControls = new CameraControls( camera, renderer.domElement );
  cameraControls.dollySpeed = 0.1


  // ANIMATION
  let animateFns = []
  function renderLoop() {
    requestAnimationFrame( renderLoop );

    for(let i=0; i<animateFns.length; i++){
      animateFns[i]()
    }

    // controls.update();
    const delta = clock.getDelta();
    updateCameraDistance(camera, cameraControls, carObjects)
    const hasControlsUpdated = cameraControls.update( delta );


    renderer.render( scene, camera );
  }
  renderLoop()

  /**
   * 
   * @param {Function} fn 
   */
  function subscribeAnimation(fn){
    animateFns.push(fn)
  }

  createEnvMap(scene, renderer)

  // CUBE
  createCube(scene, subscribeAnimation)

  // GROUND
  createGround(scene)


  return {scene, renderer, subscribeAnimation}
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


function createCube (scene, subscribeAnimation) {
  // let {scene} = ThreeAnimation
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  cube.position.y = 2
  cube.castShadow = true
  scene.add( cube );
  cube.position.z = -3;
  cube.position.x = -3

  function animate(){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  subscribeAnimation(animate)
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

function loadModel(filePath) { 
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



function defaultCarModel(car){
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



export function createCar(ThreeAnimation, car, index, totalNumbers, color){
  let {scene} = ThreeAnimation
  // MODELS
  let carObject
  let carBody
  let wheelObjects = []
  let wheel
  let carModel = car.props.model
  let wheelModel = car.props.modelWheel
  loadModel(wheelModel)
  .catch((e) => {
    return loadModel('wheel')
  })
  .then((wheelScene) => {
    wheel = wheelScene.scene.children[0]
    wheel.material = clayMaterial.clone()
    wheel.material.color = new THREE.Color(0x333333)
  })
  .catch((e) => {
    console.error(e)
  })
  .then(() => {
    return loadModel(carModel)
  }).catch((e) => {
    return defaultCarModel(car)
  }).then((gltf) => {

    console.log('loaded model', gltf)

    carObject = gltf.scene
    // carObject.castShadow = true
    scene.add( carObject )

    carObjects.push(carObject)

    let wheelDiameter = car.props.wheelDiameter || 63

    // Initial position
    const distanceBetweenCar = 3
    carObject.position.x += index*distanceBetweenCar - ((totalNumbers-1) * distanceBetweenCar/2)
    carObject.position.y += wheelDiameter/250

    carObject.traverse((a) => {
      // Wheels
      if(a.name.indexOf('Wheel') === 0){
        let carWheel = wheel.clone()
        carWheel.position.copy(a.position)

        // // inverse main scene scale if needed
        // wheel.scale.x = 1/carObject.scale.x
        // wheel.scale.y = 1/carObject.scale.y
        // wheel.scale.z = 1/carObject.scale.z

        if(!!a.name.match(/R$/g)){
          console.log('right wheel', carWheel)
          carWheel.scale.x *= -1
        }

        carObject.add(carWheel)

        wheelObjects.push(carWheel)
      }

      if ( a instanceof THREE.Mesh ) {
        console.log('set cast shadow')
        a.castShadow = true
        a.receiveShadow = false
        // a.material.color = new THREE.Color(color)
        const texture = a.material.map;
        const newTexture = changeTextureColor(texture, color)
        a.material.map = newTexture

        // a.material.normalMap = clayMaterial.normalMap;
      }


      // Every thing other than wheel
      if(a.name.indexOf('Wheel') < 0){
        // let colorCode = ...color
        // a.material = clayMaterial.clone()
        // console.log(a)
        if(a && a.material){
          // a.material.color = new THREE.Color(color)
        }
      }

      // body
      if(a.name.indexOf('Body') >= 0){
        carBody = a
      }
    })

    console.log("car created : ", carBody, car.id)
  })

  function update(dt, car){
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

  // ThreeAnimation.subscribeAnimation(animate)

  return { update }
}



function changeTextureColor(texture, color) {
  if(!texture) return null

  // create a canvas element to modify the texture
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  context.drawImage(texture.image, 0, 0);

  // modify the hue of the canvas
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b] = imageData.data.slice(i, i + 3);
    const [h, s, l] = rgbToHsl(r, g, b); // convert RGB to HSL
    const [newR, newG, newB] = hslToRgb(0.2, s, l); // modify the hue
    imageData.data.set([newR, newG, newB], i);
  }
  context.putImageData(imageData, 0, 0);

  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  newTexture.minFilter = THREE.NearestMipmapNearestFilter
  newTexture.magFilter = THREE.NearestFilter
  newTexture.flipY = false // FLIP as Y-axis in the WebGL coordinate system is inverted compared to the canvas coordinate system

  return newTexture
}


function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// Converts an HSL color value to RGB (red, green, blue)
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}