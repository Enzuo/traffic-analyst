import * as THREE from 'three'

// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
                           // 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

cube.position.z = -5;

// LIGHTS
let ambLight = new THREE.AmbientLight( 0x404040, 0.3 ); // soft white light
scene.add( ambLight );

let directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
const targetObject = new THREE.Object3D();
targetObject.position.set(-300, -300, -300)
directionalLight.target = targetObject;
scene.add(targetObject);
scene.add( directionalLight );

let ptLight = new THREE.PointLight( 0xffffff, 100, 0 );
ptLight.position.set( -300, 300, 300 );
scene.add( ptLight );

// ENV MAP
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( '/models/env.jpeg' );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.encoding = THREE.sRGBEncoding;

scene.environment = textureEquirec

let background = new THREE.Color( 0xaaaaaa );
scene.background = background

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

// CAMERA
camera.position.z = 100;
const controls = new OrbitControls( camera, renderer.domElement );


// MODELS
const loader = new GLTFLoader()
loader.load( '/models/zoe.glb', function ( gltf ) {
    scene.add( gltf.scene );
})



function animate() {
  requestAnimationFrame( animate );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  // applyAnimation(ANIM_STATE, MY_ANIMATIONS)
  renderer.render( scene, camera );
}
animate()