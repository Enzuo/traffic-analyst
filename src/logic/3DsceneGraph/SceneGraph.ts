import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import CameraControls from 'camera-controls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { createCarObject } from './car'
import { AnimationRotation, AnimationSimulation } from './Animation'
import { Scene3D } from './Scene3D'

/***
 *
   _____  _____ ______ _   _ ______ _____ _____            _____  _    _
  / ____|/ ____|  ____| \ | |  ____/ ____|  __ \     /\   |  __ \| |  | |
 | (___ | |    | |__  |  \| | |__ | |  __| |__) |   /  \  | |__) | |__| |
  \___ \| |    |  __| | . ` |  __|| | |_ |  _  /   / /\ \ |  ___/|  __  |
  ____) | |____| |____| |\  | |___| |__| | | \ \  / ____ \| |    | |  | |
 |_____/ \_____|______|_| \_|______\_____|_|  \_\/_/    \_\_|    |_|  |_|


 */

export class SingleCarSceneGraph extends Scene3D {

  constructor(car){
    super()

    createGround(this.scene)

    this.animation = new AnimationRotation(this.scene, this.camera, this.renderer, this.cameraControls)
    this.animation.start()

    createCarObject(car).then((c) => this.animation.setCar(c.object))
  }

  // --------

  updateData(car){
    this.animation.removeCar().then((obj) => {
      if(obj) this.scene.remove(obj)
    })
    createCarObject(car).then((c) => this.animation.setCar(c.object))
  }
}





export class SceneGraph extends Scene3D {

  constructor(cars, simulation, colors){
    super()

    // ANIMATION
    this.animation = new AnimationSimulation(this.scene, this.camera, this.renderer, this.cameraControls, simulation)
    this.animation.start()

    // CUBE
    const animatedCube = createCube(this.scene)
    this.animation.addAnimatedObject(animatedCube)

    // GROUND
    createGround(this.scene)

    // CARS
    cars.forEach((car, index) => {
      const distanceBetweenCar = 3
      const position = index*distanceBetweenCar - ((cars.length-1) * distanceBetweenCar/2)
      const carObject = createCarObject(car, position, colors[index])
      carObject.then((aObj) => {
        this.scene.add(aObj.object)
        this.animation.addAnimatedObject(aObj)
      })
    })
  }
}





/**
 *
 * @param {THREE.Scene} scene
 * @returns {AnimatedObject}
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

  return { animate, object:cube }
}

function createGround (scene, length=10) {
  // const groundGeometry = new THREE.PlaneBufferGeometry(10000, 10000)
  // const groundMaterial = new THREE.ShadowMaterial();
  // groundMaterial.opacity = 0.5; // set the opacity of the shadow material
  const groundGeometry = new THREE.PlaneGeometry(10, length);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.position.y = -1; // position the plane at y = -1 so that it is below other objects in the scene
  ground.rotation.x = -Math.PI / 2; // rotate the plane to lie flat on the x-z plane
  ground.receiveShadow = true; // enable the plane to receive shadows
  scene.add(ground);
}



