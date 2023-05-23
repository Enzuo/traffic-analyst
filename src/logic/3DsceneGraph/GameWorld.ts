import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from './sceneGraph'
import CANNON from 'cannon'
import db from '@/logic/cardata/database'
import { createCarEntity } from '../carLogic/carEntity'
import { createCarObject } from './car'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

CameraControls.install( { THREE: THREE } )


class AnimationWorld extends Animation {
  constructor (scene, camera, renderer, CameraControls) {
    super(scene, camera, renderer, CameraControls)
  }
}


class Scene3D {

  public scene : THREE.Scene
  public renderer : THREE.WebGLRenderer
  public sceneElement : HTMLElement

  public camera : THREE.PerspectiveCamera
  public animation



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

    const cameraControls = new CameraControls( this.camera, this.renderer.domElement );
    cameraControls.dollySpeed = 0.1

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
    this.animation = new Animation(this.scene, this.camera, this.renderer, cameraControls)
    this.animation.start()
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

  public physicsWorld: CANNON.World;



  constructor () {
    super()


    // Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		this.physicsWorld.solver.iterations = 10;
		this.physicsWorld.allowSleep = true;


    // Car
    const car = db.car.get('renault_zoe')
    const carEntity = createCarEntity(car)
    const carObject = createCarObject(carEntity)
    carObject.then((aObj) => {
      console.log(aObj)
      this.scene.add(aObj.object)
    })


  }





}