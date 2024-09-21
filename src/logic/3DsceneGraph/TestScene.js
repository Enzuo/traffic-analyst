import { Animation } from "./Animation";
import CameraControls from 'camera-controls'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { loadModel } from "./loader"
import * as THREE from 'three'
import { WheelProcedural } from "./WheelProcedural";
import { parseTireCode } from "../lib/carlib";

CameraControls.install( { THREE: THREE } )


export function createScene(element){


  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( element.clientWidth, element.clientHeight );
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setClearColor( 0xffffff, 0);

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


  async function init(){
    // let glb = await loadModel('ford_thamestrader')

    // const emissiveTexture = new THREE.TextureLoader().load('3dmodels/ford_thamestrader_txt_em.png');
    // emissiveTexture.repeat.y = 1;                 // Negative value mirrors the texture on X-axis
    // emissiveTexture.repeat.x = 1;                 // Negative value mirrors the texture on X-axis
    // emissiveTexture.flipY = false;
    // emissiveTexture.magFilter = THREE.NearestFilter;

    // let object = glb.scene.children[0]
    // object.material.emissive = new THREE.Color( 0xffffff );
    // object.material.emissiveMap = emissiveTexture
    // object.material.emissiveIntensity = 5


    // Wheel
    let glb = await loadModel('wheelGeneric')
    let object = glb.scene.children[0]
    // object.material = new THREE.MeshBasicMaterial() // not affected by lights, debug
    object.material = new THREE.MeshStandardMaterial()
    object.material.color = new THREE.Color(0x777777)
    // object.material.emissive = new THREE.Color( 0xffffff );

    console.log(glb)
    console.log(object)

    // scene.add(object)
    let amblight = new THREE.AmbientLight( 0xcccccc, 1 )
    scene.add( amblight );
    let light = new THREE.PointLight(0xffffff, 10)
    light.position.set(2,2,2)
    scene.add( light );

    wheel = new WheelProcedural(object)
    wheel.resize()
    scene.add(wheel)


  }

  // TEST procedural wheel
  let wheel

  function setWheelCode(tireCode){
    const sizes = parseTireCode(tireCode)
    if(wheel && sizes){
      wheel.resize(sizes[0], sizes[1], sizes[2])
    }
  }

  function destroy(){
    animation.stop()
  }

  init()

  return {
    debugPerf : animation.debugPerf,
    destroy,
    setWheelCode,
  }

}

