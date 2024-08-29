import { Animation } from "./Animation";
import CameraControls from 'camera-controls'

import { loadModel } from "./loader"
import * as THREE from 'three'

CameraControls.install( { THREE: THREE } )


export function createScene(element){


  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ReinhardToneMapping;
  element.appendChild( renderer.domElement );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200 );
  camera.position.set( 0, 0, 20 );
  camera.lookAt( 0, 0, 0 );

  const controls = new CameraControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 1;
  controls.maxDistance = 100;
  // controls.addEventListener( 'change', render );

  const animation = new Animation(scene, camera, renderer, controls)
  animation.start()

  init()

  async function init(){
    let glb = await loadModel('assets/test_cube')
    let object = glb.scene.children[0]
    scene.add(object)
  }

}

