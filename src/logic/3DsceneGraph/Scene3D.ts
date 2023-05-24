import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from './sceneGraph'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'


export class Scene3D {

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