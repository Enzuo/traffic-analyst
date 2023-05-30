import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import type { Wheel } from '@/logic/3DsceneGraph/CarEntity3D'
import { WheelTypes } from '@/logic/3DsceneGraph/CarEntity3D'
import * as Utils from './Utils'


export class CarPhysics {
  // public bodyMesh
  public physicsBody: CANNON.Body
  public rayCastVehicle: CANNON.RaycastVehicle;
  public wheels

  // controls
  public steeringValue = 0
  public forceValue = 0
  public brakeForceValue = 0

  //
  public speed

  constructor(physicsWorld : CANNON.World, carBody : THREE.Mesh, carWheels : Wheel[]) {
    // this.bodyMesh = carBody
    this.wheels = carWheels

    // Calc bounding box
    let heightY = carBody.geometry.boundingBox.max.y - carBody.geometry.boundingBox.min.y
    let offsetY = heightY/2 - carBody.geometry.boundingBox.min.y


    const shape = new CANNON.Box(new CANNON.Vec3(1,heightY/2,1))
    const mass = 1500
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



    // this.rayCastVehicle.setSteeringValue(0.3, 0)
    // this.rayCastVehicle.setSteeringValue(0.3, 1)
    // this.rayCastVehicle.applyEngineForce(-1500, 0)


    this.rayCastVehicle.addToWorld(physicsWorld);

    // physicsWorld.addBody(this.physicsBody)
  }

  steerWheels (value){
    // console.log('steer', value)
    this.wheels.forEach((wheel) => {
      if(wheel.wheelType === WheelTypes.Front) {
        this.rayCastVehicle.setSteeringValue(value, wheel.rayCastWheelInfoIndex)
      }
    })
  }

  forceToWheels(value){
    let tractivesWheels = this.wheels.reduce((acc, wheel) => {
      if(wheel.wheelType === WheelTypes.Front){
        acc.push(wheel)
      }
      return acc
    }, [])

    const nbTractiveWheels = tractivesWheels.length
    tractivesWheels.forEach((wheel) => {
      this.rayCastVehicle.applyEngineForce(-value/nbTractiveWheels, wheel.rayCastWheelInfoIndex)
    })
  }

  brakeWheels(force){
    this.wheels.forEach((wheel) => {
      this.rayCastVehicle.setBrake(force/this.wheels.length, wheel.rayCastWheelInfoIndex)
    })
  }

  animate(delta) {
    // for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++)
		// {
		// 	this.rayCastVehicle.updateWheelTransform(i);
		// 	let transform = this.rayCastVehicle.wheelInfos[i].worldTransform;

		// 	let wheelObject = this.wheels[i];
		// 	wheelObject.position.copy(Utils.threeVector(transform.position));
		// 	wheelObject.quaternion.copy(Utils.threeQuat(transform.quaternion));

		// 	let upAxisWorld = new CANNON.Vec3();
		// 	this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
		// }

    // Controls :
    this.steerWheels(this.steeringValue)
    this.forceToWheels(this.forceValue)
    this.brakeWheels(this.brakeForceValue)
    // this.rayCastVehicle.setBrake()


		const quat = Utils.threeQuat(this.physicsBody.quaternion);
		const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    this.speed = this.physicsBody.velocity.dot(Utils.cannonVector(forward));

  }
}