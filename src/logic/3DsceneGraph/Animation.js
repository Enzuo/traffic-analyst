import { createPerformanceObserver } from '@/debug/performance/PerformanceObserver'
import * as THREE from 'three'

/**
 * AnimatedObject
 * @typedef {Object} AnimatedObject
 * @property {(delta:number) => void} animate - animation function
 * @property {THREE.Object3D} object 3d object
 */

/***
 *
           _   _ _____ __  __       _______ _____ ____  _   _
     /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | |
    /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| |
   / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` |
  / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  |
 /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_|


 */

export class Animation {
  constructor (scene, camera, renderer, cameraControls) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.cameraControls = cameraControls
    this.clock = new THREE.Clock()
    this.animationFrame

    /** @type {Array.<AnimatedObject>} */
    this.animatables = []

    this.debugPerf = createPerformanceObserver('Animation')
  }

  start() {
    cancelAnimationFrame(this.animationFrame)
    this.animationLoop()
  }

  stop() {
    cancelAnimationFrame(this.animationFrame)
  }

  animationLoop() {
    this.animationFrame = requestAnimationFrame( this.animationLoop.bind(this) );
    const delta = this.clock.getDelta() * 1000 // delta ms
    this.debugPerf.measureStart()
    this.renderer.render(this.scene, this.camera );
    this.debugPerf.measureEnd()
    this.animate(delta)

    for(let i=0; i<this.animatables.length; i++){
      this.animatables[i].animate(delta)
    }

    this.cameraControls.update( delta );
  }

  addAnimated(animated){
    this.animatables.push(animated)
  }

  animate(delta) {

  }
}












export class AnimationRotation extends Animation {
  constructor (scene, camera, renderer, CameraControls) {
    super(scene, camera, renderer, CameraControls)

    this.isChangingCar = true
    /** @type {Promise<THREE.Object3D|void>} */
    this.removeAnimation = Promise.resolve()
    this.currentRotation = 0
    this.ANIM_SPEED = 150
  }



  async setCar(carObject) {
    await this.removeAnimation
    this.scene.add(carObject)
    this.carObject = carObject

    this.removeAnimation = setTimeoutPromise(() => {
      this.isChangingCar = false
    }, this.ANIM_SPEED)
  }

  async removeCar() {
    await this.removeAnimation
    this.isChangingCar = true
    let carToRemove = this.carObject
    this.removeAnimation = setTimeoutPromise(() => carToRemove, this.ANIM_SPEED)
    return this.removeAnimation
  }

  animate() {
    if(this.carObject) {
      if(this.isChangingCar){
        this.carObject.rotation.y += 0.5
      }
      else {
        this.currentRotation += 0.003
        this.carObject.rotation.y = this.currentRotation
      }
    }
  }
}














export class AnimationSimulation extends Animation {
  constructor (scene, camera, renderer, CameraControls, simulation) {
    super(scene, camera, renderer, CameraControls)

    this.simulation = simulation
    /** @type {Array.<AnimatedObject>} */
    this.animated = []
  }

  animate(delta) {
    if(this.simulation.isPlaying){
      for(let i=0; i<this.animated.length; i++){
        this.animated[i].animate(delta)
      }
    }

    updateCameraDistance(this.camera, this.cameraControls, this.animated)
  }

  /**
   *
   * @param {AnimatedObject} aObj
   */
  addAnimatedObject (aObj) {
    this.animated.push(aObj)
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

function updateCameraDistance(camera, cameraControls, cars){
  let positions = []
  for(let i=0; i<cars.length; i++){
    positions.push(cars[i].object.position.z)
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
