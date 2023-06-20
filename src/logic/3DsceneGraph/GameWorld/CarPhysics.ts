import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import type { Wheel } from '@/logic/3DsceneGraph/CarEntity3D'
import { WheelTypes } from '@/logic/3DsceneGraph/CarEntity3D'
import * as Utils from './Utils'


export class CarPhysics {
  // public bodyMesh
  public physicsBody: CANNON.Body
  public rayCastVehicle: CANNON.RaycastVehicle;
  public wheels : Wheel[]

  // controls
  public steeringValue = 0
  public forceValue = 0
  public brakeForceValue = 0

  // spec
  public skidSteer = false
  public transmission : string

  //
  public speed

  constructor(physicsWorld : CANNON.World, carBody : THREE.Mesh, carWheels : Wheel[], carProps) {
    const {width, weight, wheelDiameter} = carProps
    this.skidSteer = carProps.skidSteer
    this.transmission = carProps.type || 'fwd'
    console.log(this.transmission)
    // this.bodyMesh = carBody
    this.wheels = carWheels

    // Calc bounding box
    let widthX = width ? width/1000 : carBody.geometry.boundingBox.max.x - carBody.geometry.boundingBox.min.x
    let heightY = carBody.geometry.boundingBox.max.y - carBody.geometry.boundingBox.min.y
    let lengthZ = carBody.geometry.boundingBox.max.z - carBody.geometry.boundingBox.min.z
    let offsetY = heightY/2 + carBody.geometry.boundingBox.min.y


    const shape = new CANNON.Box(new CANNON.Vec3(widthX/2,heightY/2,lengthZ/2))
    const mass = weight
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

    const suspensionRestLength = 0.35
    this.wheels.forEach((wheel) => {
      const handlingSetup = {
        radius: wheelDiameter/200,
        suspensionStiffness: 20,
        suspensionRestLength: suspensionRestLength,
        maxSuspensionTravel: 1,
        frictionSlip: 0.8,
        dampingRelaxation: 2,
        dampingCompression: 2,
        rollInfluence: 0.8,
      }
      // let connectionOffset = [0.1, 0.2, -0.1]
      let connectionOffset = [0, suspensionRestLength - 0.1, 0]
      handlingSetup.chassisConnectionPointLocal = new CANNON.Vec3(),
      handlingSetup.axleLocal = new CANNON.Vec3(-1, 0, 0);
      handlingSetup.directionLocal = new CANNON.Vec3(0, -1, 0);
      handlingSetup.chassisConnectionPointLocal.set(wheel.position.x + connectionOffset[0], wheel.position.y + connectionOffset[1], wheel.position.z + connectionOffset[2]);
			const index = this.rayCastVehicle.addWheel(handlingSetup);
			wheel.rayCastWheelInfoIndex = index;
    })



    this.rayCastVehicle.addToWorld(physicsWorld);

    // physicsWorld.addBody(this.physicsBody)
  }

  steerWheels (value){
    if(this.skidSteer) return
    // console.log('steer', value)
    this.wheels.forEach((wheel) => {
      if(wheel.wheelType === WheelTypes.Front) {
        this.rayCastVehicle.setSteeringValue(value, wheel.rayCastWheelInfoIndex)
      }
    })
  }

  forceToWheels(value){
    // TODO move this to init
    let tractivesWheels = this.wheels.reduce((acc, wheel) => {

      if(this.transmission === 'fwd' && wheel.wheelType === WheelTypes.Front){
        acc.push(wheel)
      }
      if(this.transmission === 'rwd' && wheel.wheelType === WheelTypes.Rear){
        acc.push(wheel)
      }
      if(this.transmission.match(/awd/i)){
        acc.push(wheel)
      }

      return acc
    }, [])

    const nbTractiveWheels = tractivesWheels.length
    tractivesWheels.forEach((wheel) => {
      let force = -value/nbTractiveWheels
      if(this.skidSteer){
        force = wheel.isRight ? force - this.steeringValue * 5000 : force + this.steeringValue * 5000
      }
      this.rayCastVehicle.applyEngineForce(force, wheel.rayCastWheelInfoIndex)
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