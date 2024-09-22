import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from './Animation'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

CameraControls.install( { THREE: THREE } )



export class Scene3D {

  public scene : THREE.Scene
  public renderer : THREE.WebGLRenderer
  public domElement : HTMLElement
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

    this.domElement = this.renderer.domElement

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

  // TODO not sure we need this when we can access animation scene.animation.start
  start() {
    this.animation.start()
  }

  stop() {
    this.animation.stop()
  }

  destroy () {
    this.stop()
  }
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
  let path = 'models/env/venice_sunset_1k.hdr'
  new RGBELoader()
      .load( path, ( texture ) => {

        const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
        pmremGenerator.dispose();
        scene.environment = envMap
        scene.background = null // envMap
      })

}






function createScene () {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.physicallyCorrectLights = true; // much better colors (https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js)
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.useLegacyLights = false;
  renderer.setClearColor( 0xffffff, 0);
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
  directionalLight.position.set(0, 10, 0)
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

  // directionalLight.shadow.camera.left = -128;
  // directionalLight.shadow.camera.right = 128;
  // directionalLight.shadow.camera.top = 128;
  // directionalLight.shadow.camera.bottom = -128;


  // const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
  // scene.add( helper );

}

function createCamera (renderer) {
    // CAMERA
    const ratio = 1 // window.innerWidth / window.innerHeight
    const camera = new THREE.PerspectiveCamera( 75, ratio, 0.1, 1000 );
    camera.position.z = 5;

    const cameraControls = new CameraControls( camera, renderer.domElement );
    cameraControls.dollySpeed = 0.1

    return {camera, cameraControls}
}

