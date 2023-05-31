import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from '../Animation'
import * as CANNON from 'cannon-es'
import db from '@/logic/cardata/database'
import { CarEntity } from '../../carLogic/CarEntity'
import { TrimeshCollider } from './physics/TrimeshCollider'
import CannonDebugger from 'cannon-es-debugger'
import { Scene3D } from '../Scene3D'
import { CarEntity3D, WheelTypes, createCarEntity3D } from '@/logic/3DsceneGraph/CarEntity3D'
import { loadCarModel, loadWheelModel } from '../loader'
import type {Wheel} from '../CarEntity3D'
import { getCar } from '../../cardata'
import { InputManager } from './InputManager'
import { CarEntityControllable } from './CarEntityControllable'
import { Cone } from './Cone'


class AnimationWorld extends Animation {
  public physicsWorld : CANNON.World
  public physicsDebugger
  constructor (scene, camera, renderer, CameraControls, physicsWorld, physicsDebugger) {
    super(scene, camera, renderer, CameraControls)
    this.physicsWorld = physicsWorld
    this.physicsDebugger = physicsDebugger
  }

  animate (delta) {
    const MAX_PHYSIC_STEP = 50 // avoid physic jump when there is a long delta, sending cars flying everywhere
    this.physicsWorld.step(Math.min(delta, MAX_PHYSIC_STEP)/1000)
    this.physicsDebugger.update()
  }
}





export class GameWorld extends Scene3D {

  public physicsWorld: CANNON.World
  public physicsDebugger
  public inputManager : InputManager

  public carEntityControlled : CarEntityControllable



  constructor () {
    super()

    // Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		this.physicsWorld.solver.iterations = 10;
		this.physicsWorld.allowSleep = true;

    //CUBE
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = 2
    cube.castShadow = true
    this.scene.add( cube );
    cube.position.z = 0;
    cube.position.x = 0


    // Car
    const car = getCar('renault_zoe')
    const carEntityControlled = new CarEntityControllable(car, this.scene, this.physicsWorld)
    this.carEntityControlled = carEntityControlled

    // Cone
    const cone = new Cone(this.scene, this.physicsWorld)

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.position.y = -1; // position the plane at y = -1 so that it is below other objects in the scene
    ground.rotation.x = -Math.PI / 2; // rotate the plane to lie flat on the x-z plane
    ground.receiveShadow = true; // enable the plane to receive shadows
    this.scene.add(ground);
    let phys = new TrimeshCollider(ground, {})
    this.physicsWorld.addBody(phys.body);

    // Physic temp ground
		let mat = new CANNON.Material('boxMat');
		mat.friction = 0.3
		let shape = new CANNON.Box(new CANNON.Vec3(10, 0.01, 10))
		let physBox = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(0, 0, 0),
			shape
		});
		physBox.material = mat
    this.physicsWorld.addBody(physBox)

    // DEBUGGER
    this.physicsDebugger = new CannonDebugger(this.scene, this.physicsWorld, {
      // options...
    })



    // Animation
    this.animation = new AnimationWorld(this.scene, this.camera, this.renderer, this.cameraControls, this.physicsWorld, this.physicsDebugger)
    this.animation.addAnimated(carEntityControlled)
    this.animation.addAnimated(cone)


    // Input Controls
    this.inputManager = new InputManager(this.domElement)
    this.inputManager.inputReceiver = carEntityControlled


    // Start world
    this.start()
  }
}






