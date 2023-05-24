import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Animation } from './Animation'
import * as CANNON from 'cannon-es'
import db from '@/logic/cardata/database'
import { createCarEntity } from '../carLogic/carEntity'
import { createCarObject } from './car'
import { TrimeshCollider } from './physics/TrimeshCollider'
import CannonDebugger from 'cannon-es-debugger'
import { Scene3D } from './Scene3D'
import { CarEntity3D, WheelTypes, createCarEntity3D } from './CarEntity3D'
import { loadCarModel, loadWheelModel } from './loader'
import type {Wheel} from './CarEntity3D'


class AnimationWorld extends Animation {
  public physicsWorld : CANNON.World
  public physicsDebugger
  constructor (scene, camera, renderer, CameraControls, physicsWorld, physicsDebugger) {
    super(scene, camera, renderer, CameraControls)
    this.physicsWorld = physicsWorld
    this.physicsDebugger = physicsDebugger
  }

  animate (delta) {
    this.physicsWorld.step(delta/1000)
    this.physicsDebugger.update()
  }
}





export class GameWorld extends Scene3D {

  public physicsWorld: CANNON.World
  public physicsDebugger



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
    const car = db.car.get('renault_zoe')
    const carEntity = createCarEntity(car)
    // const carObject = new CarEntity3D(carEntity)
    createCarEntity3D(carEntity).then((carEntity3D) => {
      this.scene.add(carEntity3D.objectGroup)
      let physics = new CarPhysics (this.physicsWorld, carEntity3D.carBody, carEntity3D.wheels)
      this.animation.addAnimated(physics)
    })
    // const carObject = createCarObject(carEntity)


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




    // Start world
    this.start()
  }
}

class CarPhysics {
  public bodyMesh
  public physicsBody
  public rayCastVehicle: CANNON.RaycastVehicle;
  public wheels

  constructor(physicsWorld : CANNON.World, carBody : THREE.Mesh, carWheels : Wheel[]) {
    this.bodyMesh = carBody
    this.wheels = carWheels



    console.log(carBody)
    // Calc bounding box
    let heightY = carBody.geometry.boundingBox.max.y - carBody.geometry.boundingBox.min.y
    let offsetY = heightY/2 - carBody.geometry.boundingBox.min.y

    //


    const shape = new CANNON.Box(new CANNON.Vec3(1,heightY/2,1))
    const mass = 1
    this.physicsBody = new CANNON.Body({
      mass
    });
    this.physicsBody.addShape(shape, new CANNON.Vec3(0, offsetY, 0))
    this.physicsBody.angularVelocity.set(0,10,0)
    this.physicsBody.angularDamping = 0.5
    this.physicsBody.position.y = 5


    this.rayCastVehicle = new CANNON.RaycastVehicle({
			chassisBody: this.physicsBody,
			indexUpAxis: 1,
			indexRightAxis: 0,
			indexForwardAxis: 2
		});

    this.wheels.forEach((wheel) => {
      console.log(wheel)

      const handlingSetup = {
        radius: 0.25,
        suspensionStiffness: 20,
        suspensionRestLength: 0.35,
        maxSuspensionTravel: 1,
        frictionSlip: 0.8,
        dampingRelaxation: 2,
        dampingCompression: 2,
        rollInfluence: 0.8
      }
      handlingSetup.chassisConnectionPointLocal = new CANNON.Vec3(),
      handlingSetup.axleLocal = new CANNON.Vec3(-1, 0, 0);
      handlingSetup.directionLocal = new CANNON.Vec3(0, -1, 0);
      handlingSetup.chassisConnectionPointLocal.set(wheel.position.x + 0.1, wheel.position.y + 0.2, wheel.position.z - 0.1);
			const index = this.rayCastVehicle.addWheel(handlingSetup);
			wheel.rayCastWheelInfoIndex = index;
    })

    this.wheels.forEach((wheel) => {
      console.log('wheel', wheel)
      if(wheel.wheelType === WheelTypes.Front) {
        this.rayCastVehicle.setSteeringValue(0.5, wheel.rayCastWheelInfoIndex)
        this.rayCastVehicle.setSteeringValue(0.5, wheel.rayCastWheelInfoIndex)
      }
    })

    // this.rayCastVehicle.setSteeringValue(0.3, 0)
    // this.rayCastVehicle.setSteeringValue(0.3, 1)
    // this.rayCastVehicle.applyEngineForce(-1, 0)


    this.rayCastVehicle.addToWorld(physicsWorld);

    // physicsWorld.addBody(this.physicsBody)
  }

  animate(delta) {
    this.bodyMesh.position.copy(this.physicsBody.position)
    this.bodyMesh.quaternion.copy(this.physicsBody.quaternion)

    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++)
		{
			this.rayCastVehicle.updateWheelTransform(i);
			let transform = this.rayCastVehicle.wheelInfos[i].worldTransform;

			let wheelObject = this.wheels[i];
			wheelObject.position.copy(threeVector(transform.position));
			wheelObject.quaternion.copy(threeQuat(transform.quaternion));

			let upAxisWorld = new CANNON.Vec3();
			this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
		}
  }
}

function threeVector(vec: CANNON.Vec3): THREE.Vector3
{
	return new THREE.Vector3(vec.x, vec.y, vec.z);
}

function threeQuat(quat: CANNON.Quaternion): THREE.Quaternion
{
	return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}