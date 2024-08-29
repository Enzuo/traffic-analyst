import { Animation } from "./Animation";
import CameraControls from 'camera-controls'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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

  const composer = new EffectComposer( renderer );
  const animation = new Animation(scene, camera, composer, controls)
  animation.start()

  const params = {
    threshold: 1,
    strength: 1,
    radius: 0,
    exposure: 1
  };

  const renderScene = new RenderPass( scene, camera );

  const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;

  const outputPass = new OutputPass();
  composer.addPass( renderScene );
  // composer.addPass( bloomPass );
  // composer.addPass( outputPass );

  init()

  async function init(){
    let glb = await loadModel('assets/test_cube_hdr')
    let object = glb.scene.children[0]
    scene.add(object)

    scene.add( new THREE.AmbientLight( 0xcccccc ) );

  }

  function destroy(){
    animation.stop()
  }

  return {
    debugPerf : animation.debugPerf,
    destroy,
  }

}

