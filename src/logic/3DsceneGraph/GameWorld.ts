import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from './sceneGraph'
import CANNON from 'cannon'
import db from '@/logic/cardata/database'
import { createCarEntity } from '../carLogic/carEntity'
import { createCarObject } from './car'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { TrimeshCollider } from './physics/TrimeshCollider'

CameraControls.install( { THREE: THREE } )


class AnimationWorld extends Animation {
  public physicsWorld : CANNON.World
  constructor (scene, camera, renderer, CameraControls, physicsWorld) {
    super(scene, camera, renderer, CameraControls)
    this.physicsWorld = physicsWorld
  }

  animate (delta) {
    this.physicsWorld.step(delta/1000)
  }
}


class Scene3D {

  public scene : THREE.Scene
  public renderer : THREE.WebGLRenderer
  public sceneElement : HTMLElement
  public camera : THREE.PerspectiveCamera
  public cameraControls : CameraControls
  public animation : Animation



  constructor () {

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.physicallyCorrectLights = true; // much better colors (https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js)
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.useLegacyLights = false;
    this.renderer.setClearColor( 0xffffff, 0);
    this.renderer.setSize( 300, 300 );

    this.renderer.toneMappingExposure = 0.1;


    // SHADOWS
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.sceneElement = this.renderer.domElement

    // LIGHTS
    let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0)
    directionalLight.position.set(0, 10, 0)
    directionalLight.target = targetObject;
    directionalLight.castShadow = true;
    this.scene.add(targetObject);
    this.scene.add( directionalLight );

    // ENV
    let pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();
    let path = 'models/env/venice_sunset_1k.hdr'
    new RGBELoader()
        .load( path, ( texture ) => {

          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();
          this.scene.environment = envMap
          this.scene.background = null // envMap
        })


    // MAIN CAMERA
    const ratio = 1 // window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera( 75, ratio, 0.1, 1000 );
    this.camera.position.z = 5;

    this.cameraControls = new CameraControls( this.camera, this.renderer.domElement );
    this.cameraControls.dollySpeed = 0.1

    //CUBE
    // let {scene} = ThreeAnimation
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = 2
    cube.castShadow = true
    this.scene.add( cube );
    cube.position.z = 0;
    cube.position.x = 0

    //
    this.renderer.render(this.scene, this.camera );
    this.animation = new Animation(this.scene, this.camera, this.renderer, this.cameraControls)
  }

  updateSceneOpts(opts) {
    const {width, height} = opts
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  start() {
    this.animation.start()
  }

  stop() {
    this.animation.stop()
  }

}


export class GameWorld extends Scene3D {

  public physicsWorld: CANNON.World



  constructor () {
    super()

    // Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		this.physicsWorld.solver.iterations = 10;
		this.physicsWorld.allowSleep = true;

    // Animation
    this.animation = new AnimationWorld(this.scene, this.camera, this.renderer, this.cameraControls, this.physicsWorld)


    // Car
    const car = db.car.get('renault_zoe')
    const carEntity = createCarEntity(car)
    const carObject = createCarObject(carEntity)
    carObject.then((aObj) => {
      console.log(aObj)
      this.scene.add(aObj.object)
      let physics = new CarPhysics (this.physicsWorld, aObj.carBody)
      this.animation.addAnimated(physics)
    })

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 3600);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.position.y = -1; // position the plane at y = -1 so that it is below other objects in the scene
    ground.rotation.x = -Math.PI / 2; // rotate the plane to lie flat on the x-z plane
    ground.receiveShadow = true; // enable the plane to receive shadows
    this.scene.add(ground);
    let phys = new TrimeshCollider(ground, {})
    this.physicsWorld.addBody(phys.body);



    // Start world
    this.start()
  }
}

class CarPhysics {
  public bodyMesh
  public physicsBody

  constructor(physicsWorld, carBody) {
    this.bodyMesh = carBody

    const shape = new CANNON.Box(new CANNON.Vec3(1,1,1))
    const mass = 1
    this.physicsBody = new CANNON.Body({
      mass
    });
    this.physicsBody.addShape(shape)
    this.physicsBody.angularVelocity.set(0,10,0)
    this.physicsBody.angularDamping = 0.5
    physicsWorld.addBody(this.physicsBody)
  }

  animate(delta) {
    this.bodyMesh.position.copy(this.physicsBody.position)
    this.bodyMesh.quaternion.copy(this.physicsBody.quaternion)
  }
}